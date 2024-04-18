import { initMapLayerTool } from '@/shared'
import {
  addAlarmPointToLayer,
  alarmPointLayer,
  alarmPoints,
  handleConfirmAlarmPoint,
  initAlarmPointLayer
} from '@/shared/map/alarmPoint'
import { entryPoint, setEntryPoint } from '@/shared/map/home'
import { initPathLayer } from '@/shared/map/path'
import { patrolTaskDialogVisible } from '@/shared/map/patrolPath'
import { Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'

describe('异常位置', () => {
  let marker: Marker
  let testEntryMarker: Marker
  const testdata = [
    {
      latitude: 22.560827,
      longitude: 113.483383
    },
    {
      latitude: 22.560821,
      longitude: 113.483384
    }
  ]
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
    initAlarmPointLayer()
    testEntryMarker = new Marker([113.2, 22.2])
  })
  it('新增异常位置图层', () => {
    expect(alarmPointLayer).not.toBeUndefined()
  })

  it('handleConfirmAlarmPoint', () => {
    handleConfirmAlarmPoint(testdata)
    expect(alarmPoints.length).toBe(2)
    expect(alarmPoints[0].getMenuItems().length).toBe(1)
    expect(patrolTaskDialogVisible.value).toBe(false)
  })

  it('addAlarmPointToLayer', () => {
    const coordinates: number[][] = testdata.map((item: any) => [item.longitude, item.latitude])
    marker = new Marker(coordinates[0])
    setEntryPoint(testEntryMarker)
    addAlarmPointToLayer(marker)
    expect(alarmPointLayer.getGeometries()[0]).toBe(marker)
    expect(marker.getCenter()).toEqual(testEntryMarker.getCenter())
    expect(entryPoint).toBe(null)
  })
})
