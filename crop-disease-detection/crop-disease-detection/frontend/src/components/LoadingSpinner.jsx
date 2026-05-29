/**
 * Simple centered spinner shown while `/api/predict` is running.
 */
export default function LoadingSpinner({ label = 'Analyzing image…' }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-900/15 bg-white/60 p-10 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/35"
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600/30 border-t-emerald-600 dark:border-emerald-300/25 dark:border-t-emerald-300" />
      <p className="max-w-md text-center text-sm text-slate-700 dark:text-emerald-100/80">
        {label}
      </p>
    </div>
  )
}
