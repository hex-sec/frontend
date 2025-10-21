import { create } from 'zustand'
import { changeLanguage, type SupportedLanguage, getCurrentLanguage } from '@i18n/i18n'

export type I18nState = {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  hydrateLanguage: (language: SupportedLanguage) => void
}

export const useI18nStore = create<I18nState>((set) => ({
  language: getCurrentLanguage(),
  setLanguage: (language) => {
    const normalized = language
    set({ language: normalized })
    changeLanguage(normalized)
  },
  hydrateLanguage: (language) => set({ language }),
}))
