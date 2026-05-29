import type { ChatContext, Language } from '../types'
import { conditionLabel, t } from './i18n'

type BotAnswer = { title: string; body: string }

function includesAny(text: string, words: string[]) {
  const t = text.toLowerCase()
  return words.some((w) => t.includes(w))
}

export function answerQuestion(question: string, ctx: ChatContext, lang: Language): BotAnswer {
  const q = question.trim()
  const textLower = q.toLowerCase()

  const isIrrigation = includesAny(textLower, ['irrigat', 'water', 'watering', 'pump', 'सिंचाई', 'सिंचन', 'पाणी'])
  const isSowing = includesAny(textLower, ['sow', 'sowing', 'plant', 'planting', 'transplant', 'बुवाई', 'पेरणी'])
  const isPest = includesAny(textLower, ['pest', 'insect', 'spray', 'pesticide', 'fungus', 'कीट', 'कीड', 'फवारणी'])
  const isForecast = includesAny(textLower, ['forecast', 'tomorrow', 'next', '5 day', 'week', 'पूर्वानुमान', 'अंदाज'])
  const isAlert = includesAny(textLower, ['alert', 'warning', 'storm', 'rain', 'heatwave', 'frost', 'अलर्ट', 'इशारा', 'सूचना'])

  if (isIrrigation) {
    const s = ctx.farming.irrigation
    return {
      title: t(lang, 'chat.answer.irrigation', { value: s.valueText }),
      body: t(lang, 'chat.answer.irrigationBody', {
        hint: s.hint,
        humidity: ctx.metrics.humidityPct,
        condition: conditionLabel(lang, ctx.now.condition),
      }),
    }
  }

  if (isSowing) {
    const s = ctx.farming.planting
    return {
      title: t(lang, 'chat.answer.planting', { value: s.valueText }),
      body: t(lang, 'chat.answer.plantingBody', {
        hint: s.hint,
        temp: Math.round(ctx.now.tempC),
        wind: ctx.metrics.windKmh,
      }),
    }
  }

  if (isPest) {
    const s = ctx.farming.pestRisk
    return {
      title: t(lang, 'chat.answer.pest', { value: s.valueText }),
      body: t(lang, 'chat.answer.pestBody', { hint: s.hint }),
    }
  }

  if (isAlert) {
    const top = ctx.alerts[0]
    return {
      title: top ? top.title : t(lang, 'chat.answer.alerts'),
      body: top ? top.body : t(lang, 'chat.answer.noAlerts'),
    }
  }

  if (isForecast) {
    return {
      title: t(lang, 'chat.answer.forecastTitle'),
      body: t(lang, 'chat.answer.forecastBody'),
    }
  }

  if (includesAny(textLower, ['temperature', 'temp', 'hot', 'cold', 'तापमान'])) {
    return {
      title: t(lang, 'chat.answer.tempTitle'),
      body: t(lang, 'chat.answer.tempBody', {
        temp: Math.round(ctx.now.tempC),
        feels: Math.round(ctx.now.feelsLikeC),
        condition: conditionLabel(lang, ctx.now.condition),
      }),
    }
  }

  return {
    title: t(lang, 'chat.answer.defaultTitle'),
    body: t(lang, 'chat.answer.defaultBody'),
  }
}

