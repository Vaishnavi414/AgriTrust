import { useEffect, useState } from 'react'

import { getErrorMessage, predictWithImageFile } from './api/client.js'
import ImageDropzone from './components/ImageDropzone.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'
import PredictionCard from './components/PredictionCard.jsx'

/**
 * Main app page:
 * - uploads an image preview locally (browser only)
 * - calls Flask `/api/predict` when the user clicks Analyze
 */
export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const canAnalyze = Boolean(file) && !loading

  function handleFileChange(nextFile) {
    setFile(nextFile)
    setResult(null)
    setError(null)
  }

  async function onAnalyze() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await predictWithImageFile(file)
      if (!data?.success) {
        throw new Error(data?.error || 'Prediction failed.')
      }
      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 text-slate-900 dark:from-emerald-950 dark:via-emerald-950 dark:to-emerald-950 dark:text-emerald-50">
      <header className="border-b border-emerald-900/10 bg-white/50 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/40">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Crop Disease Detection
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-emerald-100/75">
            Upload a leaf photo to identify your crop and spot diseases early.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-3xl border border-emerald-900/10 bg-white/65 p-6 shadow-sm backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/35 dark:shadow-none sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            >
              {loading ? 'Analyzing…' : 'Analyze image'}
            </button>
          </div>

          <div className="mt-4">
            <ImageDropzone file={file} previewUrl={previewUrl} disabled={loading} onFileChange={handleFileChange} />
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="rounded-3xl border border-rose-200/80 bg-rose-50/70 p-6 text-rose-950 dark:border-rose-300/25 dark:bg-rose-400/10 dark:text-rose-50">
              <p className="text-sm font-semibold">Could not complete analysis</p>
              <p className="mt-2 text-sm text-rose-900/70 dark:text-rose-50/85">{error}</p>
            </div>
          ) : result ? (
            <PredictionCard result={result} />
          ) : (
            <div className="rounded-3xl border border-slate-200/70 bg-white/55 p-8 text-center text-sm text-slate-700 backdrop-blur dark:border-emerald-100/10 dark:bg-emerald-950/25 dark:text-emerald-100/75">
              Results will appear here after you click <span className="font-semibold">Analyze image</span>.
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
