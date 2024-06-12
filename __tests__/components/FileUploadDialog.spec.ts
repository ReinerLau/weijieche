import FileUploadDialog from '@/components/FileUploadDialog.vue'
import { initMapLayerTool } from '@/shared'
import { fileUploadDialogVisible } from '@/shared/map/file'
import { initPathLayer } from '@/shared/map/path'
import { mount } from '@vue/test-utils'
import { ElDialog } from 'element-plus'
import { beforeEach, describe, expect, it } from 'vitest'

describe('FileUploadDialog.vue', () => {
  let wrapper: any
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
    wrapper = mount(FileUploadDialog)
  })

  it('上传文件弹窗', () => {
    wrapper.findComponent(ElDialog).vm.$emit('update:modelValue', true)
    expect(fileUploadDialogVisible.value).toBe(true)
  })
})
