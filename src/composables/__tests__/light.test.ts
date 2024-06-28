import { describe, expect, it, vi } from 'vitest'
import { useLight } from '../light'

describe('灯光控制', () => {
  vi.mock('@/shared', () => ({
    currentCar: { value: 'test' }
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

  it('打开警报灯', () => {
    const { toggleAlarmLight } = useLight()

    const data = toggleAlarmLight(true)

    expect(data).toEqual({
      code: 'test',
      param1: 8,
      param2: 1,
      param3: 255,
      param4: 255
    })
  })

  it('关闭警报灯', () => {
    const { toggleAlarmLight } = useLight()

    const data = toggleAlarmLight(false)

    expect(data).toEqual({
      code: 'test',
      param1: 8,
      param2: 0,
      param3: 255,
      param4: 255
    })
  })
})
