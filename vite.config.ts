import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/configk/
export default defineConfig({
  plugins: [
    eslint({
      failOnWarning: true
    }),
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.18.164:8081',
        changeOrigin: true
      },
      '/rtc': {
        target: 'http://192.168.18.164:1985',
        changeOrigin: true
      },
      '/websocket': {
        target: 'ws://192.168.18.164',
        ws: true
      },
      '/tiles': {
        target: 'http://192.168.18.164:3000',
        changeOrigin: true
      }
    }
  }
})
