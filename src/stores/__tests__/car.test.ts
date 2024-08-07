import { describe, expect, it } from 'vitest'
import { useCarStore } from '../car'

describe('当前车辆', () => {
  it('默认没有选择车辆', () => {
    const carStore = useCarStore()

    expect(carStore.currentCar).toBe('')
  })

  it('切换车辆', () => {
    const newCarCode = '123'
    const carStore = useCarStore()

    carStore.setCurrentCar(newCarCode)

    expect(carStore.currentCar).toBe(newCarCode)
  })

  it('获取车辆列表', () => {
    const newCarList = [
      {
        id: 1,
        code: '123',
        name: 'test',
        status: '0'
      }
    ]
    const carStore = useCarStore()

    carStore.setCarList(newCarList)

    expect(carStore.carList).toEqual(newCarList)
  })
})
