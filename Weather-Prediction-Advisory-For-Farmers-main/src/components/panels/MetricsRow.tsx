import type { WeatherMetrics } from '../../types'
import { Card } from '../ui/Card'
import { HumidityIcon, PressureIcon, WindMetricIcon } from '../ui/Icon'
import { Skeleton } from '../ui/Skeleton'
import { t } from '../../lib/i18n'

import type { ReactNode } from 'react'
import type { Language } from '../../types'

function Metric(props: {
  label: string
  value: string
  icon: ReactNode
  isLoading: boolean
  tint: 'blue' | 'cyan' | 'slate' | 'amber'
}) {
  const tint =
    props.tint === 'blue'
      ? 'bg-blue-50 text-blue-600'
      : props.tint === 'cyan'
        ? 'bg-cyan-50 text-cyan-600'
        : props.tint === 'amber'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-50 text-slate-600'
  return (
    <div className="animate-soft flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/90 px-3 py-3 shadow-sm hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
      <div className={`grid h-10 w-10 place-items-center rounded-2xl ${tint}`}>{props.icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{props.label}</div>
        <div className="text-sm font-semibold text-slate-900">
          {props.isLoading ? <Skeleton className="h-4 w-16" /> : props.value}
        </div>
      </div>
    </div>
  )
}

export function MetricsRow(props: { isLoading: boolean; metrics: WeatherMetrics; language: Language }) {
  const { isLoading, metrics, language } = props
  return (
    <Card title={t(language, 'panel.weatherMetrics')}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric
          isLoading={isLoading}
          icon={<HumidityIcon className="h-4 w-4" />}
          tint="blue"
          label={t(language, 'weather.metric.humidity')}
          value={`${metrics.humidityPct}%`}
        />
        <Metric
          isLoading={isLoading}
          icon={<WindMetricIcon className="h-4 w-4" />}
          tint="cyan"
          label={t(language, 'weather.metric.wind')}
          value={`${metrics.windKmh} km/h`}
        />
        <Metric
          isLoading={isLoading}
          icon={<span className="text-sm">☁</span>}
          tint="slate"
          label={t(language, 'weather.metric.clouds')}
          value={`${metrics.cloudsPct}%`}
        />
        <Metric
          isLoading={isLoading}
          icon={<PressureIcon className="h-4 w-4" />}
          tint="amber"
          label={t(language, 'weather.metric.pressure')}
          value={`${metrics.pressureHpa} hPa`}
        />
      </div>
    </Card>
  )
}

