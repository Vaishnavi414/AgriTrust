import type { ForecastDay, Language, WeatherCondition } from '../types'
import { Card } from './ui/Card'
import { AppIcon } from './ui/Icon'
import { Skeleton } from './ui/Skeleton'
import { conditionLabel, t } from '../lib/i18n'

function iconColor(iconKey: ForecastDay['iconKey']) {
  switch (iconKey) {
    case 'sun':
      return 'text-yellow-500'
    case 'cloud-rain':
      return 'text-blue-500'
    case 'cloud-lightning':
      return 'text-violet-600'
    case 'wind':
      return 'text-cyan-600'
    case 'haze':
      return 'text-slate-500'
    case 'thermometer-sun':
      return 'text-orange-500'
    case 'cloud':
    default:
      return 'text-sky-500'
  }
}

function ForecastCard(props: {
  day: {
    id: string
    dayLabel: string
    condition: WeatherCondition
    iconKey: ForecastDay['iconKey']
    minC: number
    maxC: number
  }
  isLoading: boolean
  language: Language
}) {
  const { day, isLoading, language } = props

  return (
    <div className="animate-soft w-[150px] shrink-0 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-blue-50/90 to-blue-100/75 p-3 shadow-sm hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg">
      <div className="text-xs font-semibold text-slate-500">
        {isLoading ? <Skeleton className="h-3 w-16" /> : day.dayLabel}
      </div>

      <div className="mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-white/70 text-2xl">
        {isLoading ? (
          <Skeleton className="h-10 w-10" rounded="2xl" />
        ) : (
          <AppIcon
            name={day.iconKey || 'cloud'}
            className={`h-6 w-6 ${iconColor(day.iconKey || 'cloud')}`}
          />
        )}
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-900">
        {isLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : (
          `${day.maxC ?? 0}° / ${day.minC ?? 0}°`
        )}
      </div>

      <div className="mt-1 text-xs text-slate-600">
        {isLoading ? (
          <Skeleton className="h-3 w-24" />
        ) : (
          conditionLabel(language, day.condition)
        )}
      </div>
    </div>
  )
}

export function ForecastRow(props: {
  isLoading: boolean
  forecast?: ForecastDay[]
  language: Language
}) {
  const { isLoading, forecast = [], language } = props

  const fallbackDays: ForecastDay[] = Array.from({ length: 7 }).map((_, i) => ({
    id: String(i),
    dayLabel: t(language, 'forecast.monday'),
    condition: 'Cloudy',
    iconKey: 'cloud',
    minC: 0,
    maxC: 0,
  }))

  const days = isLoading
    ? fallbackDays.map((_, i) => forecast[i] ?? fallbackDays[i])
    : forecast.length > 0
    ? forecast
    : fallbackDays

  return (
    <Card
      title={t(language, 'panel.forecast5')}
      right={
        <span className="text-xs font-semibold text-slate-500">
          {t(language, 'app.swipeHorizontally')}
        </span>
      }
    >
      <div className="-mx-4 overflow-x-auto px-4 md:-mx-5 md:px-5">
        <div className="flex gap-3 pb-2">
          {days.slice(0, 7).map((d, idx) => (
            <ForecastCard
              key={d.id || idx}
              language={language}
              day={{
                ...d,
                dayLabel:
                  d.dayLabel?.toLowerCase() === 'monday'
                    ? t(language, 'forecast.monday')
                    : d.dayLabel || 'Day',
              }}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}