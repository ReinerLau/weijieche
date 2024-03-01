import { describe, expect, it } from 'vitest'
import { haveCurrentCar, currentCar } from '@/shared'

describe('shared', () => {
  it('校验是否已选择车辆', () => {
    expect(haveCurrentCar()).toBe(false)

    currentCar.value = 'test'

    expect(haveCurrentCar()).toBe(true)
  })
})
