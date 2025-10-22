import type { TOptions } from 'i18next'

type TranslateFn = (key: string, options?: TOptions | Record<string, unknown>) => string

type FormatBackLabelOptions = {
  baseLabel: string
  t: TranslateFn
  language?: string
}

export function formatBackLabel({ baseLabel, t, language }: FormatBackLabelOptions) {
  const prefix = t('layout.backNavigation.prefix', { lng: language })
  if (baseLabel.startsWith(prefix)) {
    return baseLabel
  }
  return t('layout.backNavigation.backTo', { label: baseLabel, lng: language })
}
