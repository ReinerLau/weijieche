import { useCarStore } from '@/stores/car'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCarSelector } from '../useCarSelector'

describe('选择车辆', () => {
  vi.mock('@/business/afterChangeCar', () => ({
    default: vi.fn()
  }))

  const getCarList = vi.hoisted(() => vi.fn())
  beforeEach(() => {
    vi.mock('@/api/list', () => ({
      getCarList
    }))
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('切换车辆', () => {
    const carCode = '123'
    const { changeCar } = useCarSelector()
    const carStore = useCarStore()

    changeCar(carCode)

    expect(carStore.currentCar).toBe(carCode)
  })

  it('点开下拉框重新查询车辆列表', async () => {
    const mockedData = [
      {
        id: 1,
        code: '123',
        name: 'test',
        status: '0'
      }
    ]
    getCarList.mockResolvedValue({
      data: mockedData
    })
    const { visibleChange } = useCarSelector()
    const carStore = useCarStore()

    await visibleChange(true)

    expect(carStore.carList).toEqual(mockedData)
  })
})
