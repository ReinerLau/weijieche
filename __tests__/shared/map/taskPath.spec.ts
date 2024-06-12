import { initMapLayerTool } from '@/shared'
import { initPathLayer } from '@/shared/map/path'
import {
  addTaskPathPointToLayer,
  handleConfirmPatrolTaskPath,
  initTaskpathLayer,
  taskPathLayer,
  taskPathPointArray,
  taskpathPoints
} from '@/shared/map/taskPath'
import { ConnectorLine, Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'

describe('任务路线', () => {
  let marker: Marker
  let marker1: Marker
  const route = ref<any[]>([])
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
    initTaskpathLayer()
  })
  it('新建任务路线图层', () => {
    expect(taskPathLayer).not.toBeUndefined()
  })
  it('handleConfirmPatrolTaskPath', () => {
    route.value.push({ x: 22, y: 113 })
    handleConfirmPatrolTaskPath(route.value)
    expect(taskPathPointArray.length).toBe(1)
  })

  it('addTaskPathPointToLayer', () => {
    expect(taskpathPoints.length).toBe(1)
    expect(taskPathLayer.getGeometries()[0]).toBe(marker)
  })

  it('taskpathPoints.length >= 2', () => {
    taskpathPoints.length = 0
    route.value.push({ x: 23, y: 114 })
    const coordinates: number[][] = route.value.map((item: any) => [item.y, item.x])
    marker = new Marker(coordinates[0])
    marker1 = new Marker(coordinates[1])
    addTaskPathPointToLayer(marker)
    addTaskPathPointToLayer(marker1)
    expect(taskpathPoints.length).toBe(2)
    expect(taskPathLayer.getGeometries()[2]).instanceOf(ConnectorLine)
    expect(taskPathLayer.getGeometries().length).toBe(3)
  })
})
