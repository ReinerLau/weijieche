import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import zh from '@/locales/zh.json'
import { createI18n } from 'vue-i18n'
import { getCookie } from '.'

const i18n = createI18n({
  legacy: false,
  locale: getCookie('locale') || 'zh',
  fallbackLocale: 'zh',
  messages: {
    en,
    zh,
    fr
  }
})

export default i18n
