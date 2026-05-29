import { useEffect, useMemo, useRef, useState } from 'react'
import { Chatbot } from './components/Chatbot'
import { Diary } from './components/Diary'
import { ForecastRow } from './components/ForecastRow'
import { Header } from './components/Header'
import { AlertsPanel } from './components/panels/AlertsPanel'
import { FarmingConditionsPanel } from './components/panels/FarmingConditionsPanel'
import { MetricsRow } from './components/panels/MetricsRow'
import { RecommendationsPanel } from './components/panels/RecommendationsPanel'
import { WeatherCard } from './components/panels/WeatherCard'
import { buildDashboardModel, buildDashboardModelFromLive } from './lib/dashboardModel'
import { t } from './lib/i18n'
import type { Language, LocationQuery } from './types'
import { fetchLiveWeather } from './lib/weatherApi'

export default function App() {
  const [query, setQuery] = useState<LocationQuery>({ kind: 'text', value: 'Pune' })
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('smart-farm-lang')
    if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved
    return 'en'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date())
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveData, setLiveData] = useState<{
    location: { key: string; name: string }
    now: ReturnType<typeof buildDashboardModel>['now']
    metrics: ReturnType<typeof buildDashboardModel>['metrics']
    forecast: ReturnType<typeof buildDashboardModel>['forecast']
  } | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const requestId = useRef(0)

  const fallbackModel = useMemo(
    () => buildDashboardModel(query, lastUpdated, language),
    [query, lastUpdated, language],
  )
  const model = useMemo(() => {
    if (!liveData) return fallbackModel
    return buildDashboardModelFromLive(liveData, language)
  }, [fallbackModel, liveData, language])

  async function runSearch(next: LocationQuery) {
    const myId = ++requestId.current
    setIsLoading(true)
    setLiveError(null)

    try {
      const live = await fetchLiveWeather(next)
      if (myId !== requestId.current) return
      setQuery(next)
      setLiveData(live)
      setLastUpdated(new Date())
      setPulseKey((k) => k + 1)
    } catch {
      if (myId !== requestId.current) return
      setQuery(next)
      setLiveData(null)
      setLastUpdated(new Date())
      setPulseKey((k) => k + 1)
      setLiveError('Live weather unavailable right now. Showing fallback values.')
    } finally {
      if (myId === requestId.current) setIsLoading(false)
    }
  }

  function refresh() {
    void runSearch(query)
  }

  function useGps() {
    if (!navigator.geolocation) {
      void runSearch({ kind: 'text', value: 'Delhi' })
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        await runSearch({ kind: 'coords', value: { lat: latitude, lon: longitude } })
      },
      async () => {
        await runSearch({ kind: 'text', value: 'Mumbai' })
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  // Keep “alive” feel: subtle auto-refresh every 5 minutes.
  useEffect(() => {
    const id = window.setInterval(() => refresh(), 5 * 60 * 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('smart-farm-lang', language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    void runSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-dvh">
      <div className="w-full px-3 pb-28 pt-3 sm:px-4 md:px-6 md:pb-12 md:pt-6 lg:px-8 xl:px-10">
        <Header
          language={language}
          onLanguageChange={setLanguage}
          isLoading={isLoading}
          locationName={model.location.name}
          lastUpdated={lastUpdated}
          onSearch={(text) => runSearch({ kind: 'text', value: text })}
          onRefresh={refresh}
          onUseGps={useGps}
        />
        {liveError ? (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/90 px-3 py-2 text-xs font-medium text-amber-800">
            {liveError}
          </div>
        ) : null}

        <main className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-12">
          <section className="md:col-span-8">
            <div className="grid grid-cols-1 gap-4">
              <WeatherCard
                key={`weather-${pulseKey}`}
                language={language}
                isLoading={isLoading}
                locationName={model.location.name}
                now={model.now}
              />

              <MetricsRow key={`metrics-${pulseKey}`} language={language} isLoading={isLoading} metrics={model.metrics} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FarmingConditionsPanel
                  key={`farm-${pulseKey}`}
                  language={language}
                  isLoading={isLoading}
                  conditions={model.farming}
                />
                <RecommendationsPanel
                  key={`recs-${pulseKey}`}
                  isLoading={isLoading}
                  language={language}
                  title={t(language, 'panel.aiRecommendations')}
                  recommendations={model.recommendations}
                />
              </div>
            </div>
          </section>

          <aside className="md:col-span-4">
            <div className="grid grid-cols-1 gap-4">
              <AlertsPanel key={`alerts-${pulseKey}`} language={language} isLoading={isLoading} alerts={model.alerts} />
              <Diary language={language} locationKey={model.location.key} locationName={model.location.name} />
            </div>
          </aside>

          <section className="md:col-span-12">
            <ForecastRow key={`fc-${pulseKey}`} language={language} isLoading={isLoading} forecast={model.forecast} />
          </section>
        </main>
      </div>

      <Chatbot language={language} isLoading={isLoading} locationName={model.location.name} context={model.chatContext} />
    </div>
  )
}
