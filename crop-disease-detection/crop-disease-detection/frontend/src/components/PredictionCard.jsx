import ConfidenceBar from './ConfidenceBar.jsx'
import RemedySection from './RemedySection.jsx'
import SeverityIndicator from './SeverityIndicator.jsx'

/**
 * Main “results” panel after a successful prediction.
 */
function displayCrop(result) {
  if (result?.crop) return result.crop
  return 'Unknown crop'
}

export default function PredictionCard({ result }) {
  const healthy = Boolean(result?.healthy)
  const status = result?.status || result?.health_status || (healthy ? 'Healthy' : 'unhealthy')
  const cropName = displayCrop(result)

  return (
    <div className="grid gap-5">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/35 dark:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-emerald-800/80 uppercase dark:text-emerald-200/80">
              Prediction summary
            </p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-baseline gap-3">
                <dt className="w-[4.5rem] shrink-0 text-sm font-medium text-slate-500 dark:text-emerald-200/70">
                  Crop:
                </dt>
                <dd className="min-w-0 text-2xl font-semibold tracking-tight text-slate-900 dark:text-emerald-50">
                  {cropName}
                </dd>
              </div>
              {healthy ? (
                <div className="flex items-baseline gap-3">
                  <dt className="w-[4.5rem] shrink-0 text-sm font-medium text-slate-500 dark:text-emerald-200/70">
                    Status:
                  </dt>
                  <dd className="min-w-0 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
                    {typeof status === 'string' && status.toLowerCase() === 'healthy' ? 'Healthy' : status}
                  </dd>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <dt className="w-[4.5rem] shrink-0 text-sm font-medium text-slate-500 dark:text-emerald-200/70">
                    Disease:
                  </dt>
                  <dd className="min-w-0 text-2xl font-semibold tracking-tight text-slate-900 dark:text-emerald-50">
                    {result?.disease || 'Unknown condition'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <div
              className={
                healthy
                  ? 'inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 ring-1 ring-emerald-200/80 dark:bg-emerald-400/15 dark:text-emerald-50 dark:ring-emerald-300/30'
                  : 'inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-950 ring-1 ring-rose-200/80 dark:bg-rose-400/15 dark:text-rose-50 dark:ring-rose-300/30'
              }
            >
              <span aria-hidden="true">{healthy ? '✔' : '!'}</span>
              <span className="capitalize">{status}</span>
            </div>

            <div className="w-full lg:w-80">
              <ConfidenceBar percent={Number(result?.confidence_percent)} />
            </div>
          </div>
        </div>
      </div>

      <SeverityIndicator severity={result?.severity} healthy={healthy} />

      <RemedySection precautions={result?.precautions} treatments={result?.treatments} />

      {Array.isArray(result?.top_predictions) && result.top_predictions.length > 0 ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/55 p-6 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/25">
          <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">
            Top alternatives (model uncertainty)
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {result.top_predictions.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-left dark:border-emerald-100/10 dark:bg-emerald-950/30"
              >
                <p className="text-xs text-slate-500 dark:text-emerald-100/65">Label</p>
                <p className="mt-1 font-mono text-xs text-slate-900 dark:text-emerald-50/90">
                  {p.label}
                </p>
                <p className="mt-3 text-xs text-slate-500 dark:text-emerald-100/65">
                  Confidence
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-emerald-50">
                  {(Number(p.confidence) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
