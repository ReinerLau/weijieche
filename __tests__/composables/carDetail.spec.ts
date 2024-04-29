import { getCarInfo } from '@/api'
import { getDetailDrawer, intervalId, statusData } from '@/composables/carDetail'
import { currentCar } from '@/shared'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
vi.mock('@/api')

const mockingData = {
  data: {
    id: 0,
    baseMode: 129,
    battery: 255,
    latitude: 22.560765,
    longitude: 113.483348,
    speed: 84,
    status: '1',
    customMode: 262144
  }
}

describe('详情抽屉', () => {
  vi.mocked(getCarInfo as any).mockImplementation(async () => mockingData)

  it('getDetailDrawer', () => {
    currentCar.value = '003'
    getDetailDrawer(true)
    expect(intervalId).not.toBe(null)
  })

  it('updateData', async () => {
    currentCar.value = '003'
    getDetailDrawer(true)
    await flushPromises()
    expect(statusData.value).toEqual(mockingData.data)
  })

  it('getDetailDrawer', () => {
    currentCar.value = '003'
    getDetailDrawer(false)
    expect(intervalId).toBe(null)
  })
})
