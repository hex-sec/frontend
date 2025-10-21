import i18next from 'i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import zh from './locales/zh.json'
import ja from './locales/ja.json'

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ja'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
// DEFAULT_LANGUAGE is set to 'es' (Spanish) for our primary audience, while FALLBACK_LANGUAGE is 'en' (English) for broader compatibility.
export const DEFAULT_LANGUAGE: SupportedLanguage = 'es'
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en'
export const LANGUAGE_STORAGE_KEY = 'hex:lang'

const LANGUAGE_TO_DIRECTION: Record<SupportedLanguage, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  fr: 'ltr',
  de: 'ltr',
  it: 'ltr',
  ru: 'ltr',
  zh: 'ltr',
  ja: 'ltr',
}

export async function initI18n(preferred?: SupportedLanguage) {
  const storedLanguage =
    typeof window !== 'undefined'
      ? (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null)
      : null
  const browserLanguage =
    typeof navigator !== 'undefined'
      ? (navigator.language?.split('-')[0] as SupportedLanguage | undefined)
      : undefined

  const initialLanguage = normalizeLanguage(preferred ?? storedLanguage ?? browserLanguage)

  await i18next.init({
    lng: initialLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      ru: { translation: ru },
      zh: { translation: zh },
      ja: { translation: ja },
    },
    interpolation: { escapeValue: false },
  })

  applyLanguageMetadata(i18next.language as SupportedLanguage)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, i18next.language)
  }

  i18next.on('languageChanged', (lng) => {
    const normalized = normalizeLanguage(lng)
    applyLanguageMetadata(normalized)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized)
    }
  })

  return i18next.language as SupportedLanguage
}

export function t(key: string, options?: Record<string, unknown>) {
  return i18next.t(key, options)
}
export function changeLanguage(lng: SupportedLanguage) {
  i18next.changeLanguage(normalizeLanguage(lng))
}

export function getCurrentLanguage(): SupportedLanguage {
  return normalizeLanguage(i18next.language)
}

function normalizeLanguage(language?: string | null): SupportedLanguage {
  if (!language) return DEFAULT_LANGUAGE
  const lower = language.toLowerCase()
  if (SUPPORTED_LANGUAGES.includes(lower as SupportedLanguage)) {
    return lower as SupportedLanguage
  }
  return DEFAULT_LANGUAGE
}

function applyLanguageMetadata(language: SupportedLanguage) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = language
  document.documentElement.dir = LANGUAGE_TO_DIRECTION[language]
}
