import type { FarmingConditions, Language, Severity } from '../../types'
import { t } from '../../lib/i18n'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

function tone(sev: Severity) {
  switch (sev) {
    case 'good':
      return { dot: 'bg-[var(--good)]', pill: 'bg-[rgba(76,175,80,0.14)] text-[color:var(--good)]' }
    case 'caution':
      return { dot: 'bg-[var(--caution)]', pill: 'bg-[rgba(255,167,38,0.16)] text-[color:var(--caution)]' }
    case 'risk':
      return { dot: 'bg-[var(--risk)]', pill: 'bg-[rgba(239,83,80,0.16)] text-[color:var(--risk)]' }
  }
}

function Row(props: {
  isLoading: boolean
  label: string
  value: string
  severity: Severity
  hint: string
}) {
  const t = tone(props.severity)
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
            <div className="text-sm font-semibold text-slate-900">{props.label}</div>
          </div>
          <div className="mt-1 text-xs text-slate-500">{props.hint}</div>
        </div>
        <div className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${t.pill}`}>
          {props.isLoading ? <Skeleton className="h-4 w-16" rounded="xl" /> : props.value}
        </div>
      </div>
    </div>
  )
}

export function FarmingConditionsPanel(props: { isLoading: boolean; conditions: FarmingConditions; language: Language }) {
  const { isLoading, conditions, language } = props
  return (
    <Card title={t(language, 'panel.smartFarming')}>
      <div className="grid gap-3">
        <Row
          isLoading={isLoading}
          label={conditions.irrigation.label}
          value={conditions.irrigation.valueText}
          severity={conditions.irrigation.severity}
          hint={conditions.irrigation.hint}
        />
        <Row
          isLoading={isLoading}
          label={conditions.planting.label}
          value={conditions.planting.valueText}
          severity={conditions.planting.severity}
          hint={conditions.planting.hint}
        />
        <Row
          isLoading={isLoading}
          label={conditions.pestRisk.label}
          value={conditions.pestRisk.valueText}
          severity={conditions.pestRisk.severity}
          hint={conditions.pestRisk.hint}
        />
        <Row
          isLoading={isLoading}
          label={conditions.droughtRisk.label}
          value={conditions.droughtRisk.valueText}
          severity={conditions.droughtRisk.severity}
          hint={conditions.droughtRisk.hint}
        />
      </div>
    </Card>
  )
}

