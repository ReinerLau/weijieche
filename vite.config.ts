import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' }), IconsResolver()]
    }),
    Icons({
      autoInstall: true
    }),
    ElementPlus({})
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
        target: 'http://119.91.145.64:8081',
        // target: 'http://127.0.0.1:4523/m1/885092-0-default',
        changeOrigin: true
      },
      '/rtc': {
        target: 'http://localhost:1985',
        changeOrigin: true
      },
      '/websocket': {
        target: 'ws://localhost:8080',
        ws: true
      },
      '/tiles': {
        target: 'ws://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
