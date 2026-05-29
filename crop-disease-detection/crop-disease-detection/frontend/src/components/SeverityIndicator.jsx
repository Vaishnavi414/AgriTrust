/**
 * Severity indicator for diseased leaves.
 *
 * Note: The backend uses a beginner-friendly heuristic; you can replace it later
 * with a model that estimates affected leaf area, spore load, etc.
 */
const LEVELS = [
  { key: 'mild', label: 'Mild' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'severe', label: 'Severe' },
]

function pillClasses(active, tone) {
  const base =
    'rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-colors'
  if (!active) {
    return `${base} text-slate-500 ring-slate-300/60 bg-white/40 dark:text-emerald-100/55 dark:ring-emerald-100/15 dark:bg-emerald-950/20`
  }
  if (tone === 'mild')
    return `${base} bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-50 dark:ring-emerald-300/35`
  if (tone === 'moderate')
    return `${base} bg-amber-50 text-amber-950 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-50 dark:ring-amber-300/35`
  return `${base} bg-rose-50 text-rose-950 ring-rose-200 dark:bg-rose-400/15 dark:text-rose-50 dark:ring-rose-300/35`
}

export default function SeverityIndicator({ severity, healthy }) {
  if (healthy) {
    return (
      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-50">
        <p className="text-sm font-semibold">Severity</p>
        <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-50/85">
          No disease severity applies when the crop looks healthy.
        </p>
      </div>
    )
  }

  const activeKey = (severity || 'mild').toLowerCase()

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
            Severity estimate
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-emerald-100/70">
            Placeholder logic today — you can upgrade this later with a dedicated severity
            model.
          </p>
        </div>
        <span
          className={pillClasses(
            true,
            activeKey === 'severe' ? 'severe' : activeKey === 'moderate' ? 'moderate' : 'mild',
          )}
        >
          {activeKey.charAt(0).toUpperCase() + activeKey.slice(1)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {LEVELS.map((lvl) => {
          const active = lvl.key === activeKey
          const tone = lvl.key === 'severe' ? 'severe' : lvl.key === 'moderate' ? 'moderate' : 'mild'
          return (
            <span key={lvl.key} className={pillClasses(active, tone)} aria-current={active}>
              {lvl.label}
            </span>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {LEVELS.map((lvl) => {
          const active = lvl.key === activeKey
          const bg =
            lvl.key === 'severe'
              ? 'bg-rose-500'
              : lvl.key === 'moderate'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          return (
            <div
              key={lvl.key}
              className={`h-2 rounded-full ${active ? `${bg} opacity-100` : 'bg-slate-200/90 dark:bg-emerald-950/55'}`}
              aria-hidden="true"
            />
          )
        })}
      </div>
    </div>
  )
}
