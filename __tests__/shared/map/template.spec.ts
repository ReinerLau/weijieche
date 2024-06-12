import { createMissionTemplate } from '@/api'
import { initMapLayerTool } from '@/shared'
import { map } from '@/shared/map/base'
import { initPathLayer, pathPoints } from '@/shared/map/path'
import { isRecord, isRecordPath, recordPathPoints } from '@/shared/map/record'
import {
  closeTemplate,
  handleConfirm,
  saveTemplateToolbarEvent,
  searchTemplateToolbarEvent,
  templateDialogVisible,
  templateSearchDialogVisible
} from '@/shared/map/template'
import { flushPromises } from '@vue/test-utils'
import * as el from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { Marker } from 'maptalks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api')

vi.mock('element-plus')

const elSpy = vi.spyOn(el, 'ElMessage')
const elBSpy = vi.spyOn(ElMessageBox, 'confirm')

const mockingData = {
  code: 200,
  data: true,
  message: '操作成功'
}

const testData = {
  name: 'testname',
  memo: 'test'
}
describe('路线模板', () => {
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
  })

  it('保存路线', () => {
    pathPoints.push(new Marker([113, 22]))
    pathPoints.push(new Marker([114, 23]))
    isRecord.value = false
    saveTemplateToolbarEvent()
    expect(templateDialogVisible.value).toBe(true)
  })

  it('handleConfirm', async () => {
    vi.mocked(createMissionTemplate as any).mockImplementation(async () => mockingData)
    handleConfirm(testData)
    await flushPromises()
    expect(elSpy).toHaveBeenCalledWith({
      type: 'success',
      message: '操作成功'
    })
    expect(templateDialogVisible.value).toBe(false)
    expect(isRecordPath.value).toBe(false)
    expect(recordPathPoints.length).toBe(0)
    expect(map.getMenuItems()).toEqual([])
  })

  it('handleConfirm', async () => {
    isRecordPath.value = true
    vi.mocked(createMissionTemplate as any).mockImplementation(async () => mockingData)
    handleConfirm(testData)
    await flushPromises()
    expect(elSpy).toHaveBeenCalledWith({
      type: 'success',
      message: '操作成功'
    })
    expect(templateDialogVisible.value).toBe(false)
    expect(isRecordPath.value).toBe(false)
    expect(recordPathPoints.length).toBe(0)
    expect(map.getMenuItems()).toEqual([])
  })

  it('closeTemplate', () => {
    closeTemplate()
    expect(elBSpy).toHaveBeenCalled()
    isRecordPath.value = true
    closeTemplate()
    expect(recordPathPoints.length).toBe(0)
  })

  it('searchTemplateToolbarEvent ', () => {
    isRecord.value = false
    searchTemplateToolbarEvent()
    expect(templateSearchDialogVisible.value).toBe(true)
  })
})
