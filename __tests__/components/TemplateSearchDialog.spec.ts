import { deleteTemplate, getTemplatePathList } from '@/api/template'
import TemplateSearchDialog from '@/components/TemplateSearchDialog.vue'
import { initMapLayerTool } from '@/shared'
import { initPathLayer } from '@/shared/map/path'
import {
  currentTemplate,
  list,
  missionTemplateId,
  params,
  queryFields,
  setCurrentTemplate,
  templateSearchDialogVisible,
  total
} from '@/shared/map/template'
import { flushPromises, mount } from '@vue/test-utils'

import { ElButton, ElDialog, ElInput, ElMessage, ElPagination, ElTable } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/template')

const elSpy = vi.spyOn(ElMessage, 'success')

const mockingData: any = {
  data: {
    list: [
      {
        createTime: '2024-03-14T16:43:17',
        id: 1,
        memo: 'name',
        name: 'test',
        mission:
          '[{"x":22.568021745344055,"y":113.49290430691838},{"x":22.567847619076673,"y":113.49291117209737,"speed":"1"},{"x":22.567847619076673,"y":113.4931957166591,"speed":"2"},{"x":22.568128706356077,"y":113.49316263008211},{"x":22.568134816942717,"y":113.49338100148998}]',
        rtype: 'patroling',
        updateTime: '2024-03-14T16:43:17'
      }
    ],
    total: 1
  }
}

vi.mocked(getTemplatePathList as any).mockImplementation(async () => mockingData)
vi.mocked(deleteTemplate as any).mockImplementation(async () => {
  return {
    code: 200,
    data: true,
    message: '操作成功'
  }
})
describe('TemplateSearchDialog.vue', () => {
  let wrapper: any
  let testwrapper: any
  beforeEach(() => {
    initMapLayerTool()
    initPathLayer()
    wrapper = mount(TemplateSearchDialog)
  })
  it('模板列表弹窗', () => {
    wrapper.findComponent(ElDialog).vm.$emit('update:modelValue', true)
    expect(templateSearchDialogVisible.value).toBe(true)
  })

  describe('查询功能', () => {
    it('查询输入框', () => {
      testwrapper = wrapper.findAllComponents(ElInput)
      testwrapper[0].vm.$emit('update:modelValue', 'test')
      testwrapper[1].vm.$emit('update:modelValue', 'name')
      expect(params.value[queryFields[0].prop]).toBe('test')
      expect(params.value[queryFields[1].prop]).toBe('name')
    })

    it('查询按钮', async () => {
      testwrapper = wrapper.findAllComponents(ElButton)
      await testwrapper[0].trigger('click')
      await flushPromises()
      expect(list.value).toEqual(mockingData.data.list)
      expect(total.value).toBe(mockingData.data.total)
    })

    it('重置按钮', async () => {
      await testwrapper[1].trigger('click')
      expect(params.value).toEqual({ limit: 10, page: 1, rtype: 'patroling' })
    })
  })

  describe('列表', () => {
    it('table', () => {
      const templateData = { id: 1, mission: '001' }
      wrapper.findComponent(ElTable).vm.$emit('current-change', templateData)
      expect(currentTemplate).toBe(templateData)
      wrapper.findComponent(ElPagination).vm.$emit('update:currentPage', 100)
      wrapper.findComponent(ElPagination).vm.$emit('update:pageSize', 100)
      expect(params.value.page).toBe(100)
      expect(params.value.limit).toBe(100)
    })

    it('table', async () => {
      testwrapper = wrapper.findAllComponents(ElButton)
      await testwrapper[2].trigger('click')
      await flushPromises()
      expect(deleteTemplate).toHaveBeenCalled()
      expect(elSpy).toHaveBeenCalledWith({
        message: '操作成功'
      })
    })

    it('onComfirm', async () => {
      testwrapper = wrapper.findAllComponents(ElButton)
      await testwrapper[3].trigger('click')
      expect(missionTemplateId.value).toBe(1)
      expect(templateSearchDialogVisible.value).toBe(false)
      setCurrentTemplate(null)
      await testwrapper[3].trigger('click')
      expect(missionTemplateId.value).toBe(1)
      expect(elSpy).toHaveBeenCalled()
    })

    it('onComfirm !currentTemplate', async () => {
      setCurrentTemplate(null)
      await testwrapper[3].trigger('click')
      expect(elSpy).toHaveBeenCalled()
    })

    it('not data', async () => {
      vi.mocked(getTemplatePathList as any).mockImplementation(async () => ({
        data: {
          list: []
        }
      }))
      await testwrapper[0].trigger('click')
      await flushPromises()
      expect(list.value).toEqual([])
    })
  })
})
