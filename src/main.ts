import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'
import zh from '@/locales/zh.json'
import { createI18n } from 'vue-i18n'

const app = createApp(App)

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    en,
    zh,
    fr
  }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
