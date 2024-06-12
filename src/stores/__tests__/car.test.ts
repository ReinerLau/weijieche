import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCarStore } from '../car'

describe('当前车辆', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('默认没有选择车辆', () => {
    const carStore = useCarStore()

    expect(carStore.currentCar).toBeNull()
  })
})
