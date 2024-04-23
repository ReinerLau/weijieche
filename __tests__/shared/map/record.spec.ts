import { currentCar, initMapLayerTool } from '@/shared'
import { map } from '@/shared/map/base'
import { initPathLayer } from '@/shared/map/path'
import {
  drawRecordPath,
  endRecording,
  filterRecordSum,
  initRecordPath,
  initRecordPathLayer,
  isRecord,
  isRecordPath,
  recordData,
  recordMenu,
  recordPath,
  recordPathLayer,
  recordPathPoints,
  recordPathToolbarEvent,
  setRecordDataValue
} from '@/shared/map/record'
import { templateDialogVisible } from '@/shared/map/template'
import * as el from 'element-plus'
import { LineString, Marker } from 'maptalks'
import { describe, expect, it, vi } from 'vitest'
vi.mock('element-plus')

const elSpy = vi.spyOn(el, 'ElMessage')

const testData = {
  latitude: 22.56121026,
  longitude: 113.4821599,
  heading: '30',
  robotCode: '003',
  rid: '003',
  robotid: '003'
}
const testData1 = {
  latitude: 22.56057187,
  longitude: 113.482299,
  heading: '40',
  robotCode: '003',
  rid: '003',
  robotid: '003'
}

describe('record', () => {
  it('录制路线图层', () => {
    initMapLayerTool()
    initPathLayer()
    initRecordPathLayer()
    expect(recordPathLayer).not.toBeUndefined()
  })

  it('开始录制', () => {
    recordPathPoints.push(new Marker([113, 22]))
    expect(recordPathPoints.length).toBe(1)
    currentCar.value = '003'
    recordPathToolbarEvent()
    expect(recordPathPoints.length).toBe(0)
    expect(recordPath.value.length).toBe(0)
    expect(elSpy).toHaveBeenCalled()
    expect(endRecording()).toBe(false)
    expect(recordPathPoints.length).toBe(0)
    expect(elSpy).toHaveBeenCalled()
    expect(map.getMenuItems()).toEqual(recordMenu)
  })

  it('已开始录制', () => {
    recordPathToolbarEvent()
    expect(elSpy).toHaveBeenCalled()
  })

  it('是否处于录制', () => {
    endRecording()
    isRecord.value = false
    expect(endRecording()).toBe(true)
  })

  it('结束录制 recordPathPoints.length < 1', () => {
    recordMenu[0].click()
    expect(elSpy).toHaveBeenCalled()
    expect(isRecord.value).toBe(false)
    expect(isRecordPath.value).toBe(false)
  })

  it('recordPathPoints.length > 1', () => {
    isRecord.value = true
    isRecordPath.value = false
    recordPathPoints.push(new Marker([113.1, 22.1]))
    recordPathPoints.push(new Marker([113.2, 22.2]))
    recordMenu[0].click()
    expect(isRecord.value).toBe(false)
    expect(elSpy).toHaveBeenCalled()
    expect(isRecordPath.value).toBe(true)
    expect(templateDialogVisible.value).toBe(true)
  })

  it('initRecordPath', () => {
    setRecordDataValue(testData1)
    initRecordPath(testData)
    expect(recordData).toBe(testData)
  })

  it('drawRecordPath', () => {
    recordPathPoints.length = 0
    currentCar.value = '003'
    isRecord.value = true
    drawRecordPath(testData)
    expect(recordPath.value.length).toBe(1)
    expect(recordPathPoints.length).toBe(1)
    drawRecordPath(testData1)
    expect(recordPathPoints.length).toBe(2)
    expect(recordPathLayer.getGeometries()[1]).instanceOf(LineString)
    expect(recordPath.value.length).toBe(filterRecordSum.value)
  })

  it('initRecordPath', () => {
    setRecordDataValue(null)
    initRecordPath(testData)
    expect(recordData).toBe(testData)
  })
})
