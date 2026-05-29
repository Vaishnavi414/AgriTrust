import type { Alert, Language, WeatherMetrics, WeatherNow } from '../types'
import { t } from './i18n'

export function buildAlerts(now: WeatherNow, metrics: WeatherMetrics, lang: Language): Alert[] {
  const alerts: Alert[] = []

  const isRain = now.condition === 'Rainy' || now.condition === 'Storm'
  const isStorm = now.condition === 'Storm'
  const isHot = now.condition === 'Heat' || now.tempC >= 37

  if (isStorm) {
    alerts.push({
      id: 'storm',
      title: t(lang, 'alert.storm.title'),
      body: t(lang, 'alert.storm.body'),
      severity: 'danger',
    })
  } else if (isRain && metrics.cloudsPct > 70) {
    alerts.push({
      id: 'heavyrain',
      title: t(lang, 'alert.rain.title'),
      body: t(lang, 'alert.rain.body'),
      severity: 'warning',
    })
  }

  if (isHot) {
    alerts.push({
      id: 'heat',
      title: t(lang, 'alert.heat.title'),
      body: t(lang, 'alert.heat.body'),
      severity: 'warning',
    })
  }

  if (now.tempC <= 9) {
    alerts.push({
      id: 'frost',
      title: t(lang, 'alert.frost.title'),
      body: t(lang, 'alert.frost.body'),
      severity: 'danger',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'ok',
      title: t(lang, 'alert.ok.title'),
      body: t(lang, 'alert.ok.body'),
      severity: 'info',
    })
  }

  return alerts
}

