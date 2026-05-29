import { useMemo, useState } from 'react'
import { GpsIcon, LeafIcon, RefreshIcon, SearchIcon } from './ui/Icon'
import { langLabel, localeForLanguage, t } from '../lib/i18n'
import type { Language } from '../types'

function formatAgo(d: Date, lang: Language) {
  const locale = localeForLanguage(lang)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000))
  if (seconds < 10) return rtf.format(0, 'second')
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return rtf.format(-mins, 'minute')
  const hrs = Math.floor(mins / 60)
  return rtf.format(-hrs, 'hour')
}

export function Header(props: {
  language: Language
  onLanguageChange: (lang: Language) => void
  locationName: string
  lastUpdated: Date
  isLoading: boolean
  onSearch: (text: string) => void
  onUseGps: () => void
  onRefresh: () => void
}) {
  const { language, onLanguageChange, locationName, lastUpdated, isLoading, onSearch, onRefresh, onUseGps } = props
  const [text, setText] = useState(locationName)

  const lastUpdatedLabel = useMemo(() => formatAgo(lastUpdated, language), [lastUpdated, language])

  return (
    <header className="animate-soft rounded-2xl border border-[var(--border)] bg-white/75 p-4 shadow-[var(--shadow)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[rgba(76,175,80,0.14)] text-[color:var(--good)]">
              <LeafIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-500">{t(language, 'app.title')}</div>
              <div className="truncate text-lg font-semibold text-slate-900">
                {locationName}
                {isLoading && <span className="ml-2 text-sm font-medium text-slate-500">{t(language, 'app.updating')}</span>}
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100/80 px-2 py-1">
              {t(language, 'app.lastUpdated')}: {lastUpdatedLabel}
            </span>
            <span className="rounded-full bg-slate-100/80 px-2 py-1">
              {new Date(lastUpdated).toLocaleString(localeForLanguage(language))}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-[420px]">
          <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
            <span>{t(language, 'lang.label')}</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none"
            >
              <option value="en">{langLabel('en')}</option>
              <option value="hi">{langLabel('hi')}</option>
              <option value="mr">{langLabel('mr')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 shadow-sm">
              <span className="text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch(text)
                }}
                placeholder={t(language, 'app.searchPlaceholder')}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                aria-label="Search location"
              />
            </div>
            <button
              className="animate-soft grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border)] bg-white shadow-sm hover:bg-slate-50 active:scale-[0.99]"
              onClick={() => onSearch(text)}
              disabled={isLoading}
              title={t(language, 'app.search')}
            >
              <span className="text-slate-700">→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className="animate-soft inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
              onClick={onUseGps}
              disabled={isLoading}
              title={t(language, 'header.gps')}
            >
              <GpsIcon />
              {t(language, 'header.gps')}
            </button>
            <button
              className="animate-soft inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99]"
              onClick={onRefresh}
              disabled={isLoading}
              title={t(language, 'app.refresh')}
            >
              <RefreshIcon />
              {t(language, 'app.refresh')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

