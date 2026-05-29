import type { Language, Recommendation } from '../../types'
import { t } from '../../lib/i18n'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'

function chipTone(emphasis: Recommendation['emphasis']) {
  switch (emphasis) {
    case 'good':
      return 'bg-[rgba(76,175,80,0.14)] text-[color:var(--good)]'
    case 'risk':
      return 'bg-[rgba(239,83,80,0.16)] text-[color:var(--risk)]'
    case 'caution':
    default:
      return 'bg-[rgba(255,167,38,0.16)] text-[color:var(--caution)]'
  }
}

export function RecommendationsPanel(props: {
  isLoading: boolean
  language: Language
  title: string
  recommendations: Recommendation[]
}) {
  const { isLoading, title, recommendations, language } = props
  return (
    <Card title={title} right={<span className="text-xs font-semibold text-slate-500">{t(language, 'app.contextAware')}</span>}>
      <div className="grid gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-16" rounded="xl" />
                </div>
                <div className="mt-2 grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </div>
            ))
          : recommendations.map((r) => (
              <div key={r.title} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{r.title}</div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${chipTone(r.emphasis)}`}>
                    {r.emphasis === 'good' ? t(language, 'rec.good') : r.emphasis === 'risk' ? t(language, 'rec.risk') : t(language, 'rec.caution')}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-700">{r.body}</div>
              </div>
            ))}
      </div>
    </Card>
  )
}

