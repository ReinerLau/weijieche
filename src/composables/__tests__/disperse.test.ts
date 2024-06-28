import { describe, expect, it, vi } from 'vitest'
import { useDisperse } from '../disperse'

describe('驱散控制', () => {
  vi.mock('@/shared', () => ({
    currentCar: { value: 'test' },
    haveCurrentCar: vi.fn(() => true)
  }))
  vi.mock('@/api', () => ({
    patrolingCruise: vi.fn()
  }))

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
