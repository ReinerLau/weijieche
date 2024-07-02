import { Map } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'
import { layerId, RealRoute } from '../realRoute'

describe('实时路线', () => {
  let map: Map
  beforeEach(() => {
    const mapContainer = document.createElement('div')
    map = new Map(mapContainer, {
      center: [113.48570073, 22.56210475],
      zoom: 12
    })
  })

  it('开启模式', () => {
    const realRoute = new RealRoute()
    realRoute.openMode(map)

    expect(realRoute.mode).toBeTruthy()
  })

  it('开启模式的时候初始化图层', () => {
    const realRoute = new RealRoute()

    realRoute.openMode(map)

    expect(map.getLayer(layerId)).toBeDefined()
  })

  it('每次收到新的位置消息添加新点', () => {
    const realRoute = new RealRoute()
    realRoute.openMode(map)
    realRoute.newPoint({ longitude: 0, latitude: 0 })

    expect(realRoute.layerGeometriesCount).toBe(1)
    expect(realRoute.pointCount).toBe(1)
  })

  it('关闭模式', () => {
    const realRoute = new RealRoute()
    realRoute.openMode(map)

    realRoute.closeMode()

    expect(realRoute.mode).toBeFalsy()
  })

  it('关闭模式并清除图层', () => {
    const realRoute = new RealRoute()
    realRoute.openMode(map)
    realRoute.newPoint({ longitude: 0, latitude: 0 })

    realRoute.closeMode()

    expect(realRoute.layerGeometriesCount).toBe(0)
    expect(realRoute.pointCount).toBe(0)
  })
})
