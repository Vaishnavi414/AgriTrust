/**
 * Visual bar for model confidence (0–100%).
 * Accessibility: includes a textual percentage for screen readers.
 */
export default function ConfidenceBar({ percent }) {
  const safe = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-800 dark:text-emerald-50">
          Confidence
        </span>
        <span className="tabular-nums text-slate-600 dark:text-emerald-100/80">
          <span className="sr-only">Confidence percentage:</span>
          {safe.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/90 dark:bg-emerald-950/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-500 ease-out dark:from-emerald-400 dark:to-teal-300"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  )
}
