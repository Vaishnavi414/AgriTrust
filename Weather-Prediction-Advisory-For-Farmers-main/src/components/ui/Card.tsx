import type { ReactNode } from 'react'

export function Card(props: {
  title?: string
  right?: ReactNode
  children: ReactNode
  className?: string
}) {
  const { title, right, children, className } = props
  return (
    <section
      className={[
        'animate-soft rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-[2px]',
        className ?? '',
      ].join(' ')}
    >
      {(title || right) && (
        <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] bg-[rgba(225,238,255,0.5)] px-4 py-3 md:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
            ) : (
              <div />
            )}
          </div>
          <div className="shrink-0">{right}</div>
        </header>
      )}
      <div className="px-4 py-4 md:px-5">{children}</div>
    </section>
  )
}

