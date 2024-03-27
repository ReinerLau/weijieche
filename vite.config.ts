import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      resolvers: [IconsResolver()]
    }),
    Icons({
      autoInstall: true
    })
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
        target: 'http://192.168.18.134:8091',
        changeOrigin: true
      },
      '/rtc': {
        target: 'http://192.168.18.233:1985',
        changeOrigin: true
      },
      '/websocket': {
        target: 'ws://192.168.18.134:8091',
        ws: true
      },
      '/tiles': {
        target: 'http://192.168.18.233:3000',
        changeOrigin: true
      }
    }
  }
})
