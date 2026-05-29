export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Storm' | 'Fog' | 'Haze' | 'Windy' | 'Heat'
export type Language = 'en' | 'hi' | 'mr'

export type IconKey =
  | 'sun'
  | 'cloud'
  | 'cloud-rain'
  | 'cloud-lightning'
  | 'wind'
  | 'haze'
  | 'thermometer-sun'

export type LocationQuery =
  | { kind: 'text'; value: string }
  | { kind: 'coords'; value: { lat: number; lon: number } }

export type Severity = 'good' | 'caution' | 'risk'

export type WeatherNow = {
  tempC: number
  feelsLikeC: number
  minC: number
  maxC: number
  condition: WeatherCondition
  iconKey: IconKey
}

export type WeatherMetrics = {
  humidityPct: number
  windKmh: number
  cloudsPct: number
  pressureHpa: number
}

export type FarmingSignal = {
  label: string
  valueText: string
  severity: Severity
  hint: string
}

export type FarmingConditions = {
  irrigation: FarmingSignal
  planting: FarmingSignal
  pestRisk: FarmingSignal
  droughtRisk: FarmingSignal
}

export type Recommendation = {
  title: string
  body: string
  emphasis?: 'good' | 'caution' | 'risk'
}

export type ForecastDay = {
  id: string
  dayLabel: string
  condition: WeatherCondition
  iconKey: IconKey
  minC: number
  maxC: number
}

export type Alert = {
  id: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'danger'
}

export type ChatContext = {
  now: WeatherNow
  metrics: WeatherMetrics
  farming: FarmingConditions
  alerts: Alert[]
}

export type DashboardModel = {
  location: { key: string; name: string }
  now: WeatherNow
  metrics: WeatherMetrics
  farming: FarmingConditions
  recommendations: Recommendation[]
  forecast: ForecastDay[]
  alerts: Alert[]
  chatContext: ChatContext
}

