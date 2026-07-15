import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import deTranslation from '../locales/de/translation.json'
import enTranslation from '../locales/en/translation.json'
import nlTranslation from '../locales/nl/translation.json'

const resources = {
    en: { translation: enTranslation },
    de: { translation: deTranslation },
    nl: { translation: nlTranslation },
}

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('app-language') || 'en' : 'en'

i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false, // React already escapes by default
    },
})

export default i18n
