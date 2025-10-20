import { t, changeLanguage } from './i18n'
import { useCallback } from 'react'

export function useTranslate() {
  const tr = useCallback((key: string) => t(key), [])
  return { t: tr, changeLanguage }
}
