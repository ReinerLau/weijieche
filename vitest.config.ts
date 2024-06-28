import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*', './__tests__'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        include: ['src/**/*.?(ts|tsx)'],
        exclude: ['src/router', 'src/types'],
        enabled: true
      },
      setupFiles: ['vitest.setup.ts']
    }
  })
)
