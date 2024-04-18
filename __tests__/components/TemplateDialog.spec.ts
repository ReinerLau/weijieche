import TemplateDialog from '@/components/TemplateDialog.vue'
import { formData, templateDialogVisible } from '@/shared/map/template'
import { mount } from '@vue/test-utils'
import { ElButton, ElDialog, ElInput } from 'element-plus'
import { beforeEach, describe, expect, it } from 'vitest'

describe('PointConfigDrawer.vue', () => {
  let wrapper: any
  let testwrapper: any
  beforeEach(() => {
    wrapper = mount(TemplateDialog)
  })

  it('change templateDialogVisible', () => {
    wrapper.findComponent(ElDialog).vm.$emit('update:modelValue', true)
    expect(templateDialogVisible.value).toBe(true)
  })

  it('pointCoordinates', async () => {
    testwrapper = wrapper.findAllComponents(ElInput)
    testwrapper[0].vm.$emit('update:modelValue', 'test')
    expect(formData.value.name).toBe('test')
    testwrapper[1].vm.$emit('update:modelValue', 'test')
    expect(formData.value.memo).toBe('test')
  })

  it('onClick', async () => {
    await wrapper.findComponent(ElButton).trigger('click')
  })
})
