import { initMapLayerTool } from '@/shared'
import { map } from '@/shared/map/base'
import { clearDrawTool } from '@/shared/map/drawTool'
import {
  entryPoint,
  homePathDrawEndEvent,
  homePathDrawLayer,
  homePathPoints,
  initHomePathDrawLayer,
  setEntryPoint
} from '@/shared/map/home'
import {
  addPathPointToLayer,
  clearPath,
  clearPathLayer,
  clearPathMenu,
  drawPathToolbarEvent,
  endDrawPath,
  getPointMenuItems,
  pathLayer,
  pathMenu,
  pathPointDrawendEvent,
  pathPoints,
  pathPointsData,
  setPointMenu
} from '@/shared/map/path'
import { isRecord, isRecordPath } from '@/shared/map/record'
import { pointCoordinates, pointSettingDialogVisible } from '@/shared/map/taskPoint'
import { ConnectorLine, Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'

describe('path', () => {
  beforeEach(() => {
    initMapLayerTool()
    clearPathLayer()
    clearDrawTool()
  })
  it('新建路线图层', () => {
    expect(pathLayer).not.toBeUndefined()
  })

  describe('drawPathToolbarEvent', () => {
    let marker: Marker
    let testMarker: Marker
    beforeEach(() => {
      marker = new Marker([113.1, 22.1])
      testMarker = new Marker([113.2, 22.2])
      drawPathToolbarEvent()
    })
    it('新建路线', () => {
      expect(isRecord.value).toBe(false)
      expect(isRecordPath.value).toBe(false)
      expect(map.getMenuItems()).toEqual(pathMenu)
    })

    it('pathPointDrawendEvent', () => {
      const eMarker = { geometry: new Marker([113.1, 22.1]) }
      pathPointDrawendEvent(eMarker)
      expect(pathLayer.getGeometries()[0]).toBe(eMarker.geometry)
    })

    it('图层是否有路线点', () => {
      pathPoints.length = 0
      addPathPointToLayer(marker)
      expect(pathLayer.getGeometries()[0]).toBe(marker)
      expect(pathPoints.length).not.toBe(0)
    })
    it('中心点', () => {
      setEntryPoint(testMarker)
      addPathPointToLayer(marker)
      expect(marker.getCenter()).toEqual(testMarker.getCenter())

      expect(entryPoint).toBe(null)
    })
    it('pathPoints.length >= 2', () => {
      addPathPointToLayer(marker)
      addPathPointToLayer(testMarker)
      expect(pathLayer.getGeometries()[2]).instanceOf(ConnectorLine)
    })
  })

  it('结束绘制路线', () => {
    pathPoints.push(new Marker([113.1, 22.1]))
    expect(pathPoints.length).toBe(1)
    endDrawPath()
    expect(map.getMenuItems()).toEqual(clearPathMenu)
    pathPoints.length = 0
    expect(pathPoints.length).toBe(0)
    endDrawPath()
    expect(map.getMenuItems()).toEqual([])
  })

  describe('右键菜单', () => {
    let marker: Marker
    let testPointMenu: any

    beforeEach(() => {
      pathPoints.length = 0
      marker = new Marker([113.1, 22.1])
      testPointMenu = getPointMenuItems(marker, 0)
      homePathPoints.length = 0
    })

    it('路线点的右键菜单', () => {
      pathPoints.push(marker)
      setPointMenu()
      expect(pathPoints.length).toBe(1)
      expect(pathPoints[0].getMenuItems()).toHaveLength(3)
    })

    it('右键菜单新增任务点', () => {
      pathLayer.clear()

      expect(pointSettingDialogVisible.value).toBe(false)

      expect(pointCoordinates.value).toBe('')

      testPointMenu[0].click()

      expect(pointSettingDialogVisible.value).toBe(true)

      expect(pointCoordinates.value).toBe(
        JSON.stringify({
          x: marker.getCoordinates().y,
          y: marker.getCoordinates().x
        })
      )
    })

    it('homePathDrawEndEvent', () => {
      initHomePathDrawLayer()
      const eMarker = { geometry: new Marker([113.1, 22.1]) }
      homePathDrawEndEvent(eMarker)
      expect(homePathDrawLayer.getGeometries()[0]).toBe(eMarker.geometry)
      expect(homePathPoints.length).toBe(1)
      const eMarker2 = { geometry: new Marker([113.4, 22.4]) }
      homePathDrawEndEvent(eMarker2)
      expect(homePathPoints.length).toBe(2)
      expect(homePathDrawLayer.getGeometries()[2]).instanceOf(ConnectorLine)
    })

    it('右键菜单添加返航点', () => {
      homePathDrawLayer.clear()
      testPointMenu[1].click()
      expect(homePathDrawLayer).not.toBeUndefined()
      expect(homePathDrawLayer.getGeometries()[0]).instanceOf(Marker)
      expect(homePathPoints.length).toBe(1)
    })
  })

  it('清空路线', () => {
    clearPath()
    expect(map.getMenuItems()).toEqual([])
  })

  it('清空路线图层', () => {
    pathPoints.push(new Marker([113, 22]))
    pathPointsData.value.push({
      x: 133,
      y: 22,
      speed: 10
    })
    expect(pathPoints.length).toBe(1)
    expect(pathPointsData.value.length).toBe(1)
    clearPathLayer()
    expect(pathLayer.getGeometries().length).toBe(0)
    expect(pathPoints.length).toBe(0)
    expect(pathPointsData.value.length).toBe(0)
  })
})
