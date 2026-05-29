import type { ForecastDay, IconKey, LocationQuery, WeatherCondition, WeatherMetrics, WeatherNow } from '../types'
import { clamp, hashStringToUint32, mulberry32, round } from './seed'

const CITY_PRESETS: Record<string, { baseTemp: number; humid: number; wind: number; clouds: number }> = {
  pune: { baseTemp: 29, humid: 55, wind: 12, clouds: 25 },
  mumbai: { baseTemp: 30, humid: 78, wind: 18, clouds: 45 },
  delhi: { baseTemp: 34, humid: 40, wind: 14, clouds: 20 },
  nagpur: { baseTemp: 36, humid: 35, wind: 16, clouds: 18 },
  bengaluru: { baseTemp: 26, humid: 62, wind: 11, clouds: 35 },
  chennai: { baseTemp: 32, humid: 70, wind: 16, clouds: 40 },
  kolkata: { baseTemp: 31, humid: 74, wind: 15, clouds: 42 },
}

function normalizeQueryKey(q: LocationQuery): string {
  if (q.kind === 'coords') return `coords:${round(q.value.lat, 3)},${round(q.value.lon, 3)}`
  return q.value.trim().toLowerCase()
}

function pickCondition(r: number, tempC: number, humidity: number, clouds: number): WeatherCondition {
  // Weighted & climate-aware selection.
  const rainScore = (humidity / 100) * 0.6 + (clouds / 100) * 0.5 - (tempC > 38 ? 0.2 : 0)
  const stormScore = rainScore * 0.7 + (clouds > 80 ? 0.15 : 0)
  const fogScore = (humidity > 85 ? 0.2 : 0) + (clouds > 65 ? 0.1 : 0)
  const heatScore = tempC > 36 ? 0.35 : 0
  const windyScore = 0.12
  const cloudyScore = 0.3 + clouds / 220
  const sunnyScore = 0.55 - clouds / 160 - rainScore / 2

  const weights: Array<[WeatherCondition, number]> = [
    ['Storm', Math.max(0, stormScore)],
    ['Rainy', Math.max(0, rainScore)],
    ['Fog', Math.max(0, fogScore)],
    ['Heat', Math.max(0, heatScore)],
    ['Windy', windyScore],
    ['Cloudy', Math.max(0.05, cloudyScore)],
    ['Sunny', Math.max(0.08, sunnyScore)],
  ]

  const total = weights.reduce((s, [, w]) => s + w, 0)
  let x = r * total
  for (const [c, w] of weights) {
    x -= w
    if (x <= 0) return c
  }
  return 'Sunny'
}

export function getLocationLabel(q: LocationQuery): { key: string; name: string } {
  const key = normalizeQueryKey(q)
  if (q.kind === 'coords') return { key, name: `GPS (${round(q.value.lat, 2)}, ${round(q.value.lon, 2)})` }
  const name = q.value.trim().replace(/\s+/g, ' ')
  return { key, name: name.length ? name : 'Unknown location' }
}

export function simulateWeatherNow(q: LocationQuery, at: Date): { now: WeatherNow; metrics: WeatherMetrics } {
  const key = normalizeQueryKey(q)
  const preset = CITY_PRESETS[key] ?? CITY_PRESETS[key.split(',')[0]] ?? { baseTemp: 30, humid: 55, wind: 12, clouds: 30 }

  const seed = hashStringToUint32(`${key}|${at.toDateString()}|${at.getHours()}`)
  const rng = mulberry32(seed)

  const diurnal = Math.sin(((at.getHours() - 6) / 24) * Math.PI * 2) // warmer afternoon
  const tempC = round(preset.baseTemp + diurnal * 4 + (rng() - 0.5) * 2, 1)
  const humidity = Math.round(clamp(preset.humid + (rng() - 0.5) * 18 - diurnal * 6, 18, 96))
  const clouds = Math.round(clamp(preset.clouds + (rng() - 0.5) * 35 + humidity / 10 - 5, 0, 100))
  const wind = round(clamp(preset.wind + (rng() - 0.5) * 12 + (clouds > 70 ? 4 : 0), 1, 45), 1)
  const pressure = Math.round(clamp(1012 + (rng() - 0.5) * 20 - (clouds > 65 ? 6 : 0), 990, 1035))

  const condition = pickCondition(rng(), tempC, humidity, clouds)

  const feels = round(
    tempC +
      (humidity > 75 ? 1.8 : humidity > 60 ? 0.8 : 0) +
      (wind > 22 ? -1.2 : wind > 16 ? -0.6 : 0),
    1,
  )

  const maxC = round(tempC + clamp(2.8 + rng() * 2.2, 2.5, 5.2), 1)
  const minC = round(tempC - clamp(2.5 + rng() * 2.4, 2.2, 5.0), 1)

  const iconKey = conditionToIconKey(condition)

  return {
    now: { tempC, feelsLikeC: feels, minC, maxC, condition, iconKey },
    metrics: { humidityPct: humidity, windKmh: wind, cloudsPct: clouds, pressureHpa: pressure },
  }
}

export function simulateForecast(q: LocationQuery, at: Date): ForecastDay[] {
  const key = normalizeQueryKey(q)
  const baseSeed = hashStringToUint32(`${key}|forecast|${at.toDateString()}`)
  const out: ForecastDay[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 1; i <= 7; i++) {
    const d = new Date(at)
    d.setDate(at.getDate() + i)
    const rng = mulberry32(baseSeed + i * 1337)

    const tempShift = (rng() - 0.5) * 3.2
    const base = simulateWeatherNow(q, d).now.tempC + tempShift

    const minC = round(base - (2.6 + rng() * 2.1), 0)
    const maxC = round(base + (2.8 + rng() * 2.4), 0)
    const hum = clamp(40 + rng() * 55, 10, 95)
    const clouds = clamp(15 + rng() * 85, 0, 100)
    const condition = pickCondition(rng(), base, hum, clouds)

    out.push({
      id: `${key}-${d.toISOString().slice(0, 10)}`,
      dayLabel: i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      condition,
      iconKey: conditionToIconKey(condition),
      minC,
      maxC,
    })
  }

  return out
}

export function conditionToIconKey(c: WeatherCondition): IconKey {
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
      return 'haze'
    case 'Haze':
      return 'haze'
    case 'Windy':
      return 'wind'
    case 'Heat':
      return 'thermometer-sun'
  }
}

