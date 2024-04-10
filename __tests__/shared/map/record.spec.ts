import { currentCar, initMapLayerTool } from '@/shared'
import { map } from '@/shared/map/base'
import {
  endRecording,
  initRecordPathLayer,
  isRecord,
  recordMenu,
  recordPathLayer,
  recordPathPoints,
  recordPathToolbarEvent
} from '@/shared/map/record'
import { Marker } from 'maptalks'
import { describe, expect, it, vi } from 'vitest'
import * as el from 'element-plus'

vi.mock('element-plus')

const elSpy = vi.spyOn(el, 'ElMessage')

describe('record', () => {
  it('录制路线图层', () => {
    initMapLayerTool()
    initRecordPathLayer()
    expect(recordPathLayer).not.toBeUndefined()
  })

  it('开始录制', () => {
    recordPathPoints.push(new Marker([113, 22]))
    expect(recordPathPoints.length).toBe(1)
    currentCar.value = '003'
    recordPathToolbarEvent()
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
})
