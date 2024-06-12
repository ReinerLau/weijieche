import { initMapLayerTool } from '@/shared'
import { initAlarmPointLayer } from '@/shared/map/alarmPoint'
import { entryPoint, setEntryPoint } from '@/shared/map/home'
import { initPathLayer } from '@/shared/map/path'
import {
  addPatrolPathPointToLayer,
  assignTaskToolbarEvent,
  clearDrawPatrolLine,
  clickPathPoint,
  handleConfirmPatrolTaskPath,
  initPatrolpathLayer,
  pathPointArray,
  patrolTaskDialogVisible,
  patrolpathLayer,
  patrolpathPoints,
  scheduleDialogVisible,
  taskListToolbarEvent
} from '@/shared/map/patrolPath'
import { isRecord } from '@/shared/map/record'
import { ConnectorLine, Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'

const testData = {
  id: 0,
  name: '003',
  route: [
    { x: 22.561210926237692, y: 113.4821599126892 },
    { x: 22.560571874231613, y: 113.482299387558 }
  ]
}

describe('巡逻路线展示', () => {
  let testMarker: Marker
  let marker: Marker

  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
    initPatrolpathLayer()
    initAlarmPointLayer()
  })

  it('新建路线图层', () => {
    expect(patrolpathLayer).not.toBeUndefined()
  })

  it('handleConfirmPatrolTaskPath', () => {
    handleConfirmPatrolTaskPath(testData)
    expect(pathPointArray.length).toBe(2)
    expect(patrolTaskDialogVisible.value).toBe(false)
  })

  describe('添加巡逻路线到图层中', () => {
    testMarker = new Marker([113.2, 22.2])
    marker = new Marker([113.1, 22.1])
    it('addPatrolPathPointToLayer', () => {
      clearDrawPatrolLine()
      const coordinates: number[][] = testData.route.map((item) => [item.y, item.x])
      const pathPoint = new Marker(coordinates[0])
      addPatrolPathPointToLayer(pathPoint)
      expect(patrolpathLayer.getGeometries()[0]).toBe(pathPoint)
      expect(patrolpathPoints.length).toBe(1)
    })

    it('中心点', () => {
      clearDrawPatrolLine()
      setEntryPoint(marker)
      addPatrolPathPointToLayer(testMarker)
      expect(marker.getCenter()).toEqual(testMarker.getCenter())
      expect(entryPoint).toBe(null)
    })

    it('patrolpathPoints.length >= 2', () => {
      addPatrolPathPointToLayer(marker)
      expect(patrolpathPoints.length).toBe(2)
      expect(patrolpathLayer.getGeometries()[1]).instanceOf(ConnectorLine)
    })
  })

  it('清空巡逻路线', () => {
    patrolpathPoints.push(testMarker)
    clearDrawPatrolLine()
    expect(patrolpathPoints.length).toBe(0)
    expect(patrolpathLayer.getGeometries().length).toBe(0)
  })

  it('assignTaskToolbarEvent', () => {
    isRecord.value = false
    assignTaskToolbarEvent()
    expect(scheduleDialogVisible.value).toBe(true)
  })

  it('taskListToolbarEvent', () => {
    isRecord.value = false
    taskListToolbarEvent()
    expect(patrolTaskDialogVisible.value).toBe(true)
  })

  it('clickPathPoint', () => {
    const eMarker = { target: new Marker([113.1, 22.1]) }
    clickPathPoint(eMarker)
    expect(entryPoint).toBe(eMarker.target)
  })
})
