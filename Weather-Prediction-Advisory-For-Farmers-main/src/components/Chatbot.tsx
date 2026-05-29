import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChatContext, Language } from '../types'
import { answerQuestion } from '../lib/chatbot'
import { conditionLabel, t } from '../lib/i18n'

type Msg = { id: string; role: 'user' | 'bot'; text: string; title?: string }

export function Chatbot(props: { isLoading: boolean; locationName: string; context: ChatContext; language: Language }) {
  const { context, isLoading, locationName, language } = props
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMsgs([
      {
        id: crypto.randomUUID(),
        role: 'bot',
        title: t(language, 'chat.greet.title'),
        text: t(language, 'chat.greet.body'),
      },
    ])
  }, [language])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [open, msgs.length])

  const hint = useMemo(() => {
    if (isLoading) return t(language, 'chat.updating')
    return `${t(language, 'chat.context')}: ${locationName} • ${Math.round(context.now.tempC)}°C • ${conditionLabel(language, context.now.condition)}`
  }, [context.now.condition, context.now.tempC, isLoading, locationName, language])

  function ask() {
    const q = text.trim()
    if (!q) return
    setText('')
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', text: q }
    const a = answerQuestion(q, context, language)
    const botMsg: Msg = { id: crypto.randomUUID(), role: 'bot', title: a.title, text: a.body }
    setMsgs((m) => [...m, userMsg, botMsg].slice(-20))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {open && (
        <div className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] bg-slate-900 px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{t(language, 'chat.title')}</div>
              <div className="truncate text-xs text-white/80">{hint}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="animate-soft rounded-2xl bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/15"
              title={t(language, 'chat.close')}
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="max-h-[52vh] overflow-auto p-3">
            <div className="grid gap-2">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={[
                    'max-w-[92%] rounded-2xl border border-[var(--border)] px-3 py-2 text-sm shadow-sm',
                    m.role === 'user'
                      ? 'ml-auto bg-slate-900 text-white'
                      : 'mr-auto bg-white text-slate-900',
                  ].join(' ')}
                >
                  {m.title && <div className="text-xs font-semibold opacity-90">{m.title}</div>}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') ask()
                }}
                placeholder={t(language, 'chat.askPlaceholder')}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none"
                aria-label="Chat input"
              />
              <button
                onClick={ask}
                className="animate-soft shrink-0 rounded-2xl bg-[var(--good)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                disabled={isLoading}
                title={t(language, 'chat.send')}
              >
                {t(language, 'chat.send')}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="animate-soft grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-xl text-white shadow-[var(--shadow)] hover:scale-[1.02] active:scale-[0.98]"
        title={open ? t(language, 'chat.close') : t(language, 'chat.open')}
      >
        💬
      </button>
    </div>
  )
}

