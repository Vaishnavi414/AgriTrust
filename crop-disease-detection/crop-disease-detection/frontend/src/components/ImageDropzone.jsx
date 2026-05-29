import { useCallback, useId, useMemo, useRef, useState } from 'react'

/**
 * Drag-and-drop (and click-to-browse) image upload.
 */
export default function ImageDropzone({
  /** @type {File | null} */
  file,
  /** @type {(f: File | null) => void} */
  onFileChange,
  /** @type {string | null} */
  previewUrl,
  disabled = false,
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const hint = useMemo(() => {
    if (disabled) return 'Please wait…'
    if (file) return 'Drag a new image here, or click to replace'
    return 'Drag & drop a leaf photo here, or click to browse'
  }, [disabled, file])

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleFiles = useCallback(
    (files) => {
      if (disabled) return
      const next = files?.[0]
      if (!next) return
      if (!next.type.startsWith('image/')) return
      onFileChange(next)
    },
    [disabled, onFileChange],
  )

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        aria-disabled={disabled}
        className={[
          'rounded-3xl border-2 border-dashed p-8 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:focus-visible:ring-offset-emerald-950',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          dragActive
            ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-300 dark:bg-emerald-400/10'
            : 'border-slate-300/80 bg-white/50 hover:bg-white/70 dark:border-emerald-100/15 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
        ].join(' ')}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-emerald-50">Upload image</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-emerald-100/75">{hint}</p>
          </div>
          <span className="inline-flex shrink-0 self-start rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white sm:self-center dark:bg-emerald-500">
            Browse
          </span>
        </div>

        {previewUrl ? (
          <div className="mt-6 grid place-items-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-emerald-100/10 dark:bg-emerald-950/35">
            <img
              src={previewUrl}
              alt="Selected leaf preview"
              className="max-h-56 w-full max-w-lg rounded-xl object-contain"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => onFileChange(null)}
          disabled={disabled || !file}
          className="rounded-xl border border-slate-200/90 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-100/15 dark:bg-emerald-950/30 dark:text-emerald-50"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
