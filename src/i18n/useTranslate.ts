import { useCallback } from 'react'
import type { TOptions } from 'i18next'
import { t, type SupportedLanguage } from './i18n'
import { useI18nStore } from '@store/i18n.store'

export function useTranslate() {
  const { language, setLanguage } = useI18nStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
  }))

  const tr = useCallback(
    (key: string, options?: TOptions) => t(key, { lng: language, ...options }),
    [language],
  )

  const changeLanguage = useCallback(
    (lng: SupportedLanguage) => {
      setLanguage(lng)
    },
    [setLanguage],
  )

  return { t: tr, changeLanguage, language }
}
