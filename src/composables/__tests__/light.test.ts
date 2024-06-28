import { describe, expect, it, vi } from 'vitest'
import { useLight } from '../useLight'

describe('灯光控制', () => {
  vi.mock('@/shared', () => ({
    currentCar: { value: 'test' },
    haveCurrentCar: vi.fn(() => true)
  }))
  vi.mock('@/api', () => ({
    patrolingCruise: vi.fn()
  }))

  it('打开泛长光', () => {
    const { openFloodingLight } = useLight()

    const data = openFloodingLight()

    expect(data).toEqual({
      code: 'test',
      param1: 7,
      param2: 1,
      param3: 3,
      param4: 255
    })
  })
})
