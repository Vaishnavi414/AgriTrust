import type { FarmingConditions, FarmingSignal, Language, Recommendation, Severity, WeatherMetrics, WeatherNow } from '../types'
import { t } from './i18n'
import { clamp } from './seed'

function severityFromScore(score01: number): Severity {
  if (score01 >= 0.66) return 'good'
  if (score01 >= 0.4) return 'caution'
  return 'risk'
}

function badge(label: string, valueText: string, severity: Severity, hint: string): FarmingSignal {
  return { label, valueText, severity, hint }
}

export function computeFarmingConditions(now: WeatherNow, metrics: WeatherMetrics, lang: Language): FarmingConditions {
  const { tempC, condition } = now
  const { humidityPct, cloudsPct, windKmh } = metrics

  const isRain = condition === 'Rainy' || condition === 'Storm'

  // Irrigation: better when not raining and humidity not too high.
  const irrigationScore = clamp((1 - (humidityPct - 45) / 70) * (isRain ? 0.2 : 1), 0, 1)
  const irrigation = badge(
    t(lang, 'farming.irrigation'),
    isRain ? t(lang, 'farming.value.holdReduce') : humidityPct > 75 ? t(lang, 'farming.value.light') : t(lang, 'farming.value.normal'),
    severityFromScore(irrigationScore),
    isRain
      ? t(lang, 'farming.hint.rainDetected')
      : humidityPct > 75
        ? t(lang, 'farming.hint.highHumidity')
        : t(lang, 'farming.hint.soilStable'),
  )

  // Planting suitability: moderate temps + not stormy + not too windy.
  const tempSuit = clamp(1 - Math.abs(tempC - 28) / 18, 0, 1)
  const windPenalty = clamp((windKmh - 18) / 25, 0, 0.35)
  const plantingScore = clamp(tempSuit - windPenalty - (condition === 'Storm' ? 0.35 : 0) - (isRain ? 0.18 : 0), 0, 1)
  const planting = badge(
    t(lang, 'farming.planting'),
    plantingScore > 0.66 ? t(lang, 'farming.value.goodWindow') : plantingScore > 0.4 ? t(lang, 'farming.value.okCare') : t(lang, 'farming.value.notIdeal'),
    severityFromScore(plantingScore),
    condition === 'Storm'
      ? t(lang, 'farming.hint.stormy')
      : isRain
        ? t(lang, 'farming.hint.wet')
        : windKmh > 22
          ? t(lang, 'farming.hint.highWind')
          : t(lang, 'farming.hint.favorable'),
  )

  // Pest risk: higher with humidity and warmth; lower with strong wind / heavy rain.
  const warmFactor = clamp((tempC - 22) / 14, 0, 1)
  const humidFactor = clamp((humidityPct - 55) / 35, 0, 1)
  const rainSuppress = isRain ? 0.25 : 0
  const pestRisk01 = clamp(0.15 + 0.55 * humidFactor + 0.35 * warmFactor - rainSuppress - (windKmh > 26 ? 0.12 : 0), 0, 1)
  const pestSeverity: Severity = pestRisk01 > 0.66 ? 'risk' : pestRisk01 > 0.4 ? 'caution' : 'good'
  const pestRisk = badge(
    t(lang, 'farming.pest'),
    pestSeverity === 'risk' ? t(lang, 'farming.value.high') : pestSeverity === 'caution' ? t(lang, 'farming.value.moderate') : t(lang, 'farming.value.low'),
    pestSeverity,
    pestSeverity === 'risk'
      ? t(lang, 'farming.hint.pestHigh')
      : pestSeverity === 'caution'
        ? t(lang, 'farming.hint.pestModerate')
        : t(lang, 'farming.hint.pestLow'),
  )

  // Drought risk: higher with heat and low humidity/clouds; lower with rain.
  const dryAir = clamp((55 - humidityPct) / 35, 0, 1)
  const lowClouds = clamp((45 - cloudsPct) / 45, 0, 1)
  const heat = clamp((tempC - 30) / 12, 0, 1)
  const droughtRisk01 = clamp(0.12 + 0.55 * heat + 0.25 * dryAir + 0.18 * lowClouds - (isRain ? 0.5 : 0), 0, 1)
  const droughtSeverity: Severity = droughtRisk01 > 0.66 ? 'risk' : droughtRisk01 > 0.4 ? 'caution' : 'good'
  const droughtRisk = badge(
    t(lang, 'farming.drought'),
    droughtSeverity === 'risk' ? t(lang, 'farming.value.high') : droughtSeverity === 'caution' ? t(lang, 'farming.value.moderate') : t(lang, 'farming.value.low'),
    droughtSeverity,
    isRain
      ? t(lang, 'farming.hint.droughtRain')
      : droughtSeverity === 'risk'
        ? t(lang, 'farming.hint.droughtHigh')
        : droughtSeverity === 'caution'
          ? t(lang, 'farming.hint.droughtModerate')
          : t(lang, 'farming.hint.droughtLow'),
  )

  return { irrigation, planting, pestRisk, droughtRisk }
}

export function buildRecommendations(
  now: WeatherNow,
  metrics: WeatherMetrics,
  farming: FarmingConditions,
  lang: Language,
): Recommendation[] {
  const recs: Recommendation[] = []
  const isRain = now.condition === 'Rainy' || now.condition === 'Storm'
  const isHot = now.condition === 'Heat' || now.tempC >= 36

  if (isRain) {
    recs.push({
      title: t(lang, 'rec.reduceIrr.title'),
      body: t(lang, 'rec.reduceIrr.body'),
      emphasis: 'caution',
    })
  } else if (farming.irrigation.severity === 'risk') {
    recs.push({
      title: t(lang, 'rec.earlyIrr.title'),
      body: t(lang, 'rec.earlyIrr.body'),
      emphasis: 'risk',
    })
  } else {
    recs.push({
      title: t(lang, 'rec.manageable.title'),
      body: t(lang, 'rec.manageable.body'),
      emphasis: 'good',
    })
  }

  if (isHot) {
    recs.push({
      title: t(lang, 'rec.noonSpray.title'),
      body: t(lang, 'rec.noonSpray.body'),
      emphasis: 'caution',
    })
  } else if (metrics.windKmh > 24) {
    recs.push({
      title: t(lang, 'rec.windSpray.title'),
      body: t(lang, 'rec.windSpray.body'),
      emphasis: 'caution',
    })
  }

  if (farming.pestRisk.severity === 'risk') {
    recs.push({
      title: t(lang, 'rec.scoutPests.title'),
      body: t(lang, 'rec.scoutPests.body'),
      emphasis: 'risk',
    })
  } else if (farming.planting.severity === 'good') {
    recs.push({
      title: t(lang, 'rec.sowHarvest.title'),
      body: t(lang, 'rec.sowHarvest.body'),
      emphasis: 'good',
    })
  } else {
    recs.push({
      title: t(lang, 'rec.planCare.title'),
      body: t(lang, 'rec.planCare.body'),
      emphasis: 'caution',
    })
  }

  return recs.slice(0, 4)
}

