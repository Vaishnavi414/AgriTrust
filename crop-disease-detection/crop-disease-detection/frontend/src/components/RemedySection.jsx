/**
 * Shows precautions + treatment suggestions returned by the backend.
 */
function List({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-emerald-100/10 dark:bg-emerald-950/25">
      <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-emerald-100/80">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-300" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RemedySection({ precautions, treatments }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <List title="Precautions" items={precautions} />
      <List title="Treatments & actions" items={treatments} />
    </div>
  )
}
