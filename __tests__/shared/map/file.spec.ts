import { initMapLayerTool } from '@/shared'
import { fileUploadDialogVisible, fileUploadToolbarEvent } from '@/shared/map/file'
import { initPathLayer } from '@/shared/map/path'
import { isRecord } from '@/shared/map/record'
import { beforeEach, describe, expect, it } from 'vitest'

describe('路线绘制', () => {
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
  })
  it('上传路线', () => {
    fileUploadToolbarEvent()
    isRecord.value = false
    expect(fileUploadDialogVisible.value).toBe(true)
  })
})
