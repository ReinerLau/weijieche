import { useCarStore } from '@/stores/car'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDisperse } from '../disperse'

describe('驱散控制', () => {
  beforeAll(() => {
    vi.mock('@/api', () => ({
      patrolingCruise: vi.fn()
    }))
  })

  beforeEach(() => {
    const carStore = useCarStore()
    carStore.setCurrentCar('test')
  })

  it('打开强驱散', () => {
    const { toggleDisperse } = useDisperse()

    const data = toggleDisperse(true)

    expect(data).toEqual({
      code: 'test',
      param1: 6,
      param2: 1,
      param3: 255,
      param4: 255
    })
  })

  it('关闭强驱散', () => {
    const { toggleDisperse } = useDisperse()

    const data = toggleDisperse(false)

    expect(data).toEqual({
      code: 'test',
      param1: 6,
      param2: 3,
      param3: 255,
      param4: 255
    })
  })
})
