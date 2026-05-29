import type { Alert } from '../../types'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { t } from '../../lib/i18n'
import type { Language } from '../../types'

function tone(severity: Alert['severity']) {
  switch (severity) {
    case 'danger':
      return 'border-[rgba(239,83,80,0.35)] bg-[rgba(239,83,80,0.08)]'
    case 'warning':
      return 'border-[rgba(255,167,38,0.45)] bg-[rgba(255,167,38,0.10)]'
    case 'info':
    default:
      return 'border-[rgba(2,132,199,0.25)] bg-[rgba(2,132,199,0.07)]'
  }
}

function icon(severity: Alert['severity']) {
  switch (severity) {
    case 'danger':
      return '⛔'
    case 'warning':
      return '⚠️'
    case 'info':
    default:
      return 'ℹ️'
  }
}

export function AlertsPanel(props: { isLoading: boolean; alerts: Alert[]; language: Language }) {
  const { isLoading, alerts, language } = props
  return (
    <Card title={t(language, 'panel.alerts')} right={<span className="text-xs font-semibold text-slate-500">{t(language, 'app.live')}</span>}>
      <div className="grid gap-3">
        {isLoading ? (
          <>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
              <Skeleton className="h-4 w-40" />
              <div className="mt-2 grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
              <Skeleton className="h-4 w-48" />
              <div className="mt-2 grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-9/12" />
              </div>
            </div>
          </>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className={`rounded-2xl border p-3 shadow-sm ${tone(a.severity)}`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-lg">{icon(a.severity)}</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{a.body}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

