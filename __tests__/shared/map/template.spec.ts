import { initMapLayerTool } from '@/shared'
import { pathPoints } from '@/shared/map/path'
import { isRecord } from '@/shared/map/record'
import { saveTemplateToolbarEvent, templateDialogVisible } from '@/shared/map/template'
import { Marker } from 'maptalks'
import { beforeEach, describe, expect, it } from 'vitest'

describe('路线模板', () => {
  beforeEach(() => {
    initMapLayerTool()
  })
  it('保存路线', () => {
    pathPoints.push(new Marker([113, 22]))
    pathPoints.push(new Marker([114, 23]))
    isRecord.value = false
    saveTemplateToolbarEvent()
    expect(templateDialogVisible.value).toBe(true)
  })
})
