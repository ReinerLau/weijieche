import { initMapLayerTool } from '@/shared'
import { initPathLayer } from '@/shared/map/path'
import { isRecord } from '@/shared/map/record'
import {
  initTaskPointLayer,
  pointCoordinates,
  pointSettingDialogVisible,
  taskPointDrawEndEvent,
  taskPointLayer,
  taskPointToolbarEvent
} from '@/shared/map/taskPoint'
import { Marker } from 'maptalks'
import { describe } from 'node:test'
import { beforeEach, expect, it } from 'vitest'

describe('任务点', () => {
  let marker: Marker
  beforeEach(() => {
    marker = new Marker([113.1, 22.1])
    initMapLayerTool()
    initTaskPointLayer()
    initPathLayer()
  })
  it('新建任务点图层', () => {
    expect(taskPointLayer).not.toBeUndefined()
  })
  it('新建任务点', () => {
    isRecord.value = false
    taskPointToolbarEvent()
  })
  it('taskPointDrawEndEvent', () => {
    taskPointDrawEndEvent({ geometry: marker })
    expect(pointSettingDialogVisible.value).toBe(true)
    expect(pointCoordinates.value).toBe(
      JSON.stringify({
        x: marker.getCoordinates().y,
        y: marker.getCoordinates().x
      })
    )
  })
})
