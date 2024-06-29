import { i18n } from '@/utils'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

HTMLCanvasElement.prototype.getContext = () => null

config.global.plugins = [i18n]

vi.mock('element-plus', () => ({
  ElMessage: vi.fn()
}))

beforeEach(() => {
  setActivePinia(createPinia())
})
