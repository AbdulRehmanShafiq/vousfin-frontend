import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ur from './locales/ur.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: localStorage.getItem('vf_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Apply RTL direction and lang attribute on initial load based on saved language
const savedLang = localStorage.getItem('vf_lang')
if (savedLang === 'ur') {
  document.documentElement.dir = 'rtl'
  document.documentElement.lang = 'ur'
} else {
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = 'en'
}

export default i18n
