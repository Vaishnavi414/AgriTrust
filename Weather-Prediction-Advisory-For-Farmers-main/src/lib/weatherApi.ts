import type {
  ForecastDay,
  IconKey,
  LocationQuery,
  WeatherCondition,
  WeatherMetrics,
  WeatherNow,
} from '../types'

type ApiPayload = {
  location: { key: string; name: string; lat: number; lon: number }
  now: WeatherNow
  metrics: WeatherMetrics
  forecast: ForecastDay[]
}

type GeocodeResult = {
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

function toKey(lat: number, lon: number) {
  return `coords:${lat.toFixed(3)},${lon.toFixed(3)}`
}

function dayLabelFromDate(isoDate: string, offsetDays: number): string {
  if (offsetDays === 1) return 'Tomorrow'
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function codeToCondition(weatherCode: number, windKmh?: number): WeatherCondition {
  // Open-Meteo weather code mapping (grouped).
  if ([95, 96, 99].includes(weatherCode)) return 'Storm'
  if ([45, 48].includes(weatherCode)) return 'Fog'
  if (
    [
      51, 53, 55, 56, 57, // drizzle/freezing drizzle
      61, 63, 65, 66, 67, // rain/freezing rain
      71, 73, 75, 77, // snow (group into rainy for farming context)
      80, 81, 82, // rain showers
      85, 86, // snow showers
    ].includes(weatherCode)
  ) {
    return 'Rainy'
  }
  if ([1, 2, 3].includes(weatherCode)) return 'Cloudy'
  if (weatherCode === 0 && (windKmh ?? 0) > 30) return 'Windy'
  if (weatherCode === 0) return 'Sunny'
  return 'Cloudy'
}

function conditionToIconKey(c: WeatherCondition): IconKey {
  switch (c) {
    case 'Sunny':
      return 'sun'
    case 'Cloudy':
      return 'cloud'
    case 'Rainy':
      return 'cloud-rain'
    case 'Storm':
      return 'cloud-lightning'
    case 'Fog':
    case 'Haze':
      return 'haze'
    case 'Windy':
      return 'wind'
    case 'Heat':
      return 'thermometer-sun'
  }
}

async function geocodeByName(name: string): Promise<GeocodeResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name,
  )}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = (await res.json()) as { results?: GeocodeResult[] }
  const top = data.results?.[0]
  if (!top) throw new Error('Location not found')
  return top
}

async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { results?: GeocodeResult[] }
  return data.results?.[0] ?? null
}

async function resolveLocation(query: LocationQuery): Promise<ApiPayload['location']> {
  if (query.kind === 'coords') {
    const { lat, lon } = query.value
    const reverse = await reverseGeocode(lat, lon)
    const name = reverse
      ? [reverse.name, reverse.admin1, reverse.country].filter(Boolean).join(', ')
      : `GPS (${lat.toFixed(2)}, ${lon.toFixed(2)})`
    return { key: toKey(lat, lon), name, lat, lon }
  }

  const geo = await geocodeByName(query.value)
  const name = [geo.name, geo.admin1, geo.country].filter(Boolean).join(', ')
  return { key: toKey(geo.latitude, geo.longitude), name, lat: geo.latitude, lon: geo.longitude }
}

export async function fetchLiveWeather(query: LocationQuery): Promise<ApiPayload> {
  const location = await resolveLocation(query)
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,cloud_cover,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`

  const res = await fetch(forecastUrl)
  if (!res.ok) throw new Error('Forecast fetch failed')
  const data = (await res.json()) as {
    current: {
      temperature_2m: number
      apparent_temperature: number
      relative_humidity_2m: number
      pressure_msl: number
      wind_speed_10m: number
      cloud_cover: number
      weather_code: number
    }
    daily: {
      time: string[]
      weather_code: number[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
    }
  }

  const currentCondition = codeToCondition(data.current.weather_code, data.current.wind_speed_10m)
  const now: WeatherNow = {
    tempC: data.current.temperature_2m,
    feelsLikeC: data.current.apparent_temperature,
    minC: data.daily.temperature_2m_min[0],
    maxC: data.daily.temperature_2m_max[0],
    condition: data.current.temperature_2m >= 38 ? 'Heat' : currentCondition,
    iconKey: conditionToIconKey(data.current.temperature_2m >= 38 ? 'Heat' : currentCondition),
  }

  const metrics: WeatherMetrics = {
    humidityPct: Math.round(data.current.relative_humidity_2m),
    windKmh: Math.round(data.current.wind_speed_10m * 10) / 10,
    cloudsPct: Math.round(data.current.cloud_cover),
    pressureHpa: Math.round(data.current.pressure_msl),
  }

  const forecast: ForecastDay[] = data.daily.time.slice(0, 7).map((isoDate, i) => {
    const condition = codeToCondition(data.daily.weather_code[i])
    return {
      id: `${location.key}-${isoDate}`,
      dayLabel: dayLabelFromDate(isoDate, i + 1),
      condition,
      iconKey: conditionToIconKey(condition),
      minC: Math.round(data.daily.temperature_2m_min[i]),
      maxC: Math.round(data.daily.temperature_2m_max[i]),
    }
  })

  return { location, now, metrics, forecast }
}

