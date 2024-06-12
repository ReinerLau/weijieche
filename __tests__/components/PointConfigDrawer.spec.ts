import PointConfigDrawer from '@/components/PointConfigDrawer.vue'
import { pathPointsData } from '@/shared/map/path'
import {
  handleConfirmPointCarConfig,
  pointConfigDrawerVisible,
  pointCoordinates,
  pointSpeed
} from '@/shared/map/pointConfig'
import { mount } from '@vue/test-utils'
import { ElButton, ElDrawer, ElInput, ElInputNumber } from 'element-plus'
import { describe, expect, it } from 'vitest'

describe('PointConfigDrawer.vue', () => {
  const wrapper = mount(PointConfigDrawer)
  it('change pointConfigDrawerVisible', () => {
    wrapper.findComponent(ElDrawer).vm.$emit('update:modelValue', true)
    expect(pointConfigDrawerVisible.value).toBe(true)
  })

  it('pointCoordinates', () => {
    wrapper
      .findComponent(ElInput)
      .vm.$emit('update:modelValue', { x: 22.561489161260994, y: 113.48357952064293 })
    expect(pointCoordinates.value).toEqual({ x: 22.561489161260994, y: 113.48357952064293 })
  })

  it('pointSpeed', () => {
    wrapper.findComponent(ElInputNumber).vm.$emit('update:modelValue', 10)
    expect(pointSpeed.value).toBe(10)
    pathPointsData.value.push({
      speed: 5,
      x: 22,
      y: 113
    })
    handleConfirmPointCarConfig(pointSpeed.value)
    expect(pathPointsData.value[0].speed).toBe(10)
  })

  it('handleConfirm', async () => {
    await wrapper.findComponent(ElButton).trigger('click')
    expect(pointConfigDrawerVisible.value).toBe(false)
  })
})
