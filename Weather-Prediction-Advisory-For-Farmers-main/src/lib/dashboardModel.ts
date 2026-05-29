import type { DashboardModel, Language, LocationQuery } from '../types'
import { buildAlerts } from './alerts'
import { buildRecommendations, computeFarmingConditions } from './farmingLogic'
import { getLocationLabel, simulateForecast, simulateWeatherNow } from './weatherSim'
import type { ForecastDay, WeatherMetrics, WeatherNow } from '../types'

export function buildDashboardModel(query: LocationQuery, at: Date, lang: Language): DashboardModel {
  const location = getLocationLabel(query)
  const { now, metrics } = simulateWeatherNow(query, at)
  const farming = computeFarmingConditions(now, metrics, lang)
  const recommendations = buildRecommendations(now, metrics, farming, lang)
  const forecast = simulateForecast(query, at)
  const alerts = buildAlerts(now, metrics, lang)

  return {
    location,
    now,
    metrics,
    farming,
    recommendations,
    forecast,
    alerts,
    chatContext: { now, metrics, farming, alerts },
  }
}

export function buildDashboardModelFromLive(
  input: {
    location: { key: string; name: string }
    now: WeatherNow
    metrics: WeatherMetrics
    forecast: ForecastDay[]
  },
  lang: Language,
): DashboardModel {
  const farming = computeFarmingConditions(input.now, input.metrics, lang)
  const recommendations = buildRecommendations(input.now, input.metrics, farming, lang)
  const alerts = buildAlerts(input.now, input.metrics, lang)

  return {
    location: input.location,
    now: input.now,
    metrics: input.metrics,
    farming,
    recommendations,
    forecast: input.forecast,
    alerts,
    chatContext: { now: input.now, metrics: input.metrics, farming, alerts },
  }
}

