import { Map } from 'maptalks'
import { describe, expect, it } from 'vitest'
import { layerId, RealRoute } from '../realRoute'

describe('实时路线', () => {
  it('初始化图层', () => {
    const mapContainer = document.createElement('div')
    const map = new Map(mapContainer, {
      center: [113.48570073, 22.56210475],
      zoom: 12
    })
    const realRoute = new RealRoute()

    realRoute.initRealRouteLayer(map)

    expect(map.getLayer(layerId)).toBeDefined()
  })
})
