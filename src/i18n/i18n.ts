import i18next from 'i18next'
import en from './locales/en.json'
import es from './locales/es.json'

export async function initI18n(defaultLang = 'en') {
  await i18next.init({
    lng: defaultLang,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: { escapeValue: false },
  })
}

export function t(key: string) {
  return i18next.t(key)
}

export function changeLanguage(lng: string) {
  i18next.changeLanguage(lng)
}
