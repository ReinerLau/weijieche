import { describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import CarSelector from '@/components/CarSelector.vue'
import { getCarList } from '@/api/list'
import { ElSelect } from 'element-plus'
import { carList, currentCar } from '@/shared'

vi.mock('@/api/list')

const mockingData = {
  data: [
    {
      id: 0,
      code: '001',
      name: '001',
      status: 1,
      battery: 100
    }
  ]
}

describe('CarSelector.vue', () => {
  it('happy path', async () => {
    vi.mocked(getCarList as any).mockImplementation(async () => mockingData)

    const wrapper = shallowMount(CarSelector)
    wrapper.findComponent(ElSelect).vm.$emit('visible-change', true)
    await flushPromises()
    expect(carList.value).toEqual(mockingData.data)
  })

  it('not data', async () => {
    vi.mocked(getCarList as any).mockImplementation(async () => ({
      data: undefined
    }))

    const wrapper = shallowMount(CarSelector)
    wrapper.findComponent(ElSelect).vm.$emit('visible-change', true)
    await flushPromises()
    expect(carList.value).toEqual([])
  })

  it('change current car', () => {
    const wrapper = shallowMount(CarSelector)
    wrapper.findComponent(ElSelect).vm.$emit('update:modelValue', 'test')
    expect(currentCar.value).toBe('test')
  })
})
