import { getCarInfo } from '@/api'
import { backToCenter, clearMenu, initMap, jumpToCoordinate, map } from '@/shared/map/base'
import { useCarStore } from '@/stores/car'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/api')

const carInfo = { data: { longitude: 0, latitude: 0 } }
vi.mocked(getCarInfo as any).mockImplementation(async () => {
  return carInfo
})

describe('base', () => {
  it('初始化地图', () => {
    expect(map).toBeFalsy()

    const mapEl = document.createElement('div')

    initMap(mapEl)

    expect(map).toBeTruthy()
  })

  it('地图跳转', () => {
    const x = 0

    const y = 0

    jumpToCoordinate(0, 0)

    const coordinate = map.getCenter()

    expect(coordinate.x).toBe(x)

    expect(coordinate.y).toBe(y)

    const zoom = map.getZoom()

    expect(zoom).toBe(18)
  })

  it('清空菜单', () => {
    map.setMenuItems([
      {
        item: 'test'
      }
    ])

    expect(map.getMenuItems()).toHaveLength(1)

    clearMenu()

    expect(map.getMenuItems()).toHaveLength(0)
  })

  it('回到中心', async () => {
    const carStore = useCarStore()
    carStore.setCurrentCar('003')
    jumpToCoordinate(100, 100)

    await backToCenter()

    const coordinate = map.getCenter()

    expect(coordinate.x).toBe(0)

    expect(coordinate.y).toBe(0)
  })
})
