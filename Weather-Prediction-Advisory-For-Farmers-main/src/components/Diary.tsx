import { useEffect, useMemo, useState } from 'react'
import { Card } from './ui/Card'
import type { Language } from '../types'
import { localeForLanguage, t } from '../lib/i18n'

type DiaryEntry = {
  id: string
  createdAt: number
  text: string
}

function storageKey(locationKey: string) {
  return `smart-farm-diary:v1:${locationKey}`
}

function load(locationKey: string): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(locationKey))
    if (!raw) return []
    const parsed = JSON.parse(raw) as DiaryEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function save(locationKey: string, entries: DiaryEntry[]) {
  localStorage.setItem(storageKey(locationKey), JSON.stringify(entries))
}

export function Diary(props: { locationKey: string; locationName: string; language: Language }) {
  const { locationKey, locationName, language } = props
  const [text, setText] = useState('')
  const [entries, setEntries] = useState<DiaryEntry[]>([])

  useEffect(() => {
    setEntries(load(locationKey))
  }, [locationKey])

  const countLabel = useMemo(() => t(language, 'diary.count', { count: entries.length }), [entries.length, language])

  function add() {
    const trimmed = text.trim()
    if (!trimmed) return
    const next: DiaryEntry = { id: crypto.randomUUID(), createdAt: Date.now(), text: trimmed }
    const updated = [next, ...entries].slice(0, 25)
    setEntries(updated)
    save(locationKey, updated)
    setText('')
  }

  function remove(id: string) {
    const updated = entries.filter((e) => e.id !== id)
    setEntries(updated)
    save(locationKey, updated)
  }

  return (
    <Card
      title={t(language, 'panel.diary')}
      right={<span className="text-xs font-semibold text-slate-500">{countLabel}</span>}
    >
      <div className="text-xs text-slate-500">
        {t(language, 'diary.savedFor')}: <span className="font-semibold text-slate-700">{locationName}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
          placeholder={t(language, 'diary.addPlaceholder')}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none"
          aria-label={t(language, 'diary.addAria')}
        />
        <button
          onClick={add}
          className="animate-soft shrink-0 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:scale-[1.01] active:scale-[0.99]"
        >
          {t(language, 'diary.save')}
        </button>
      </div>

      <div className="mt-3 grid gap-2">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/50 p-3 text-sm text-slate-600">
            {t(language, 'diary.empty')}
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-500">
                    {new Date(e.createdAt).toLocaleString(localeForLanguage(language))}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{e.text}</div>
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="animate-soft shrink-0 rounded-xl border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                  title={t(language, 'diary.delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

