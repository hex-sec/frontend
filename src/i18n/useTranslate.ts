import { t, changeLanguage, type SupportedLanguage } from './i18n'
import { useCallback } from 'react'
import type { TOptions } from 'i18next'

export function useTranslate() {
  const tr = useCallback((key: string, options?: TOptions) => t(key, options), [])
  return { t: tr, changeLanguage: (lng: SupportedLanguage) => changeLanguage(lng) }
}
