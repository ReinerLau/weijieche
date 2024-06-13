import { ElMessage } from 'element-plus'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCarStore } from '../car'

describe('当前车辆', () => {
  it('默认没有选择车辆', () => {
    const carStore = useCarStore()

    expect(carStore.currentCar).toBeUndefined()
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

  describe('校验是否已选择车辆', () => {
    afterEach(() => {
      vi.clearAllMocks()
    })
    it('已选择车辆', () => {
      const carStore = useCarStore()

      carStore.haveCurrentCar()

      expect(ElMessage).toHaveBeenCalled()
    })
    it('未选择车辆', () => {
      const carStore = useCarStore()

      carStore.setCurrentCar('123')
      carStore.haveCurrentCar()

      expect(ElMessage).not.toHaveBeenCalled()
    })
  })
})
