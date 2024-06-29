import { initMapLayerTool } from '@/shared'
import {
  initRealPath,
  initRealPathLayer,
  isReal,
  realPathLayer,
  realPathPoints
} from '@/shared/map/realRoute'
import { useCarStore } from '@/stores/car'
import { ConnectorLine, Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'

const testData = {
  latitude: 22.56121026,
  longitude: 113.4821599,
  heading: '30',
  robotCode: '003',
  rid: '003',
  robotid: '003'
}

const testData1 = {
  latitude: 22.56122,
  longitude: 113.4822,
  heading: '30',
  robotCode: '003',
  rid: '003',
  robotid: '003'
}

describe('巡逻路线展示', () => {
  beforeEach(() => {
    initMapLayerTool()
    initRealPathLayer()
    const carStore = useCarStore()
    carStore.setCurrentCar('003')
  })

  it('新建路线图层', () => {
    expect(realPathLayer).not.toBeUndefined()
  })

  it('initRealPath', () => {
    isReal.value = true
    initRealPath(testData)
    expect(realPathLayer.getGeometries()[0]).instanceOf(Marker)
    expect(realPathPoints.length).toBe(1)
  })

  it('realPathPoints.length >= 2', () => {
    initRealPath(testData1)
    expect(realPathPoints.length).toBe(2)
    expect(realPathLayer.getGeometries()[1]).instanceOf(ConnectorLine)
  })
})
