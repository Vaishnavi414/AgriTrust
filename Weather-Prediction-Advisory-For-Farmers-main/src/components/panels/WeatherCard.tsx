import { conditionLabel, t } from '../../lib/i18n'
import type { Language, WeatherNow } from '../../types'
import { Card } from '../ui/Card'
import { AppIcon } from '../ui/Icon'
import { Skeleton } from '../ui/Skeleton'

function gradientFor(condition: WeatherNow['condition']) {
  switch (condition) {
    case 'Sunny':
      return 'from-amber-200/70 via-yellow-100 to-white'
    case 'Heat':
      return 'from-orange-200/70 via-rose-100 to-white'
    case 'Rainy':
      return 'from-sky-200/70 via-blue-100 to-white'
    case 'Storm':
      return 'from-indigo-200/70 via-slate-100 to-white'
    case 'Cloudy':
      return 'from-slate-200/70 via-slate-100 to-white'
    case 'Fog':
    case 'Haze':
      return 'from-zinc-200/70 via-slate-100 to-white'
    case 'Windy':
      return 'from-cyan-200/70 via-sky-100 to-white'
  }
}

export function WeatherCard(props: { isLoading: boolean; locationName: string; now: WeatherNow; language: Language }) {
  const { isLoading, now, language } = props
  const grad = gradientFor(now.condition)

  return (
    <Card
      className={`relative overflow-hidden bg-gradient-to-br ${grad}`}
      right={
        <div className="rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          {t(language, 'panel.liveConditions')}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-slate-700 shadow-sm">
              {isLoading ? (
                <Skeleton className="h-10 w-10" rounded="2xl" />
              ) : (
                <AppIcon name={now.iconKey} className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">{t(language, 'panel.today')}</div>
              <div className="text-sm text-slate-600">
                {isLoading ? <Skeleton className="h-4 w-40" /> : conditionLabel(language, now.condition)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-end gap-3">
            {isLoading ? (
              <Skeleton className="h-14 w-36" rounded="2xl" />
            ) : (
              <div className="text-6xl font-semibold tracking-tight text-slate-900 md:text-7xl">
                {Math.round(now.tempC)}°
              </div>
            )}
            <div className="pb-2 text-sm text-slate-600">
              {isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-44" />
                </div>
              ) : (
                <div className="grid gap-1">
                  <div>
                    {t(language, 'weather.feelsLike')} <span className="font-semibold text-slate-900">{Math.round(now.feelsLikeC)}°C</span>
                  </div>
                  <div className="text-xs">
                    {t(language, 'weather.min')} <span className="font-semibold text-slate-900">{Math.round(now.minC)}°</span> · {t(language, 'weather.max')}{' '}
                    <span className="font-semibold text-slate-900">{Math.round(now.maxC)}°</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">{t(language, 'panel.quickSummary')}</div>
          <div className="mt-2 text-sm text-slate-700">
            {isLoading ? (
              <div className="grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-9/12" />
              </div>
            ) : (
              <p>
                {now.condition === 'Rainy' || now.condition === 'Storm'
                  ? t(language, 'weather.summary.rain')
                  : now.condition === 'Heat'
                    ? t(language, 'weather.summary.heat')
                    : now.condition === 'Windy'
                      ? t(language, 'weather.summary.windy')
                      : t(language, 'weather.summary.default')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

