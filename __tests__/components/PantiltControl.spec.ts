import { controlAlarmLight, patrolingCruise, postCalibrate } from '@/api/control'
import PantiltControl from '@/components/PantiltControl.vue'
import {
  alarmLight,
  angleTypes,
  autoLight,
  controlLight,
  handleAlarmLight,
  handleChangeAngle,
  highLight,
  horizonAngle,
  lightModes,
  lowLight,
  verticalAngle
} from '@/composables/usePantiltControl'
import { currentCar } from '@/shared'
import { flushPromises, mount } from '@vue/test-utils'
import { ElButton, ElSlider } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/api/control')
const mockingData = {
  code: 200,
  data: true,
  message: '操作成功'
}
describe.skip('PantiltControl.vue', () => {
  let wrapper: any
  beforeEach(() => {
    vi.mocked(patrolingCruise as any).mockImplementation(async () => mockingData)
    wrapper = mount(PantiltControl)
    currentCar.value = '003'
  })
  it('云台控制', async () => {
    wrapper.findAllComponents(ElButton)[0].trigger('click')
    await flushPromises()
    expect(patrolingCruise).toHaveBeenCalled()
  })

  it('云台校准', async () => {
    vi.mocked(postCalibrate as any).mockImplementation(async () => mockingData)
    wrapper.findAllComponents(ElButton)[6].trigger('click')
    await flushPromises()
    expect(postCalibrate).toHaveBeenCalled()
  })

  it('修改水平角度', async () => {
    wrapper.findAllComponents(ElSlider)[0].vm.$emit('update:modelValue', 10)
    expect(horizonAngle.value).toBe(10)
    handleChangeAngle(angleTypes.HORIZON)
  })
  it('修改垂直角度', async () => {
    wrapper.findAllComponents(ElSlider)[1].vm.$emit('update:modelValue', 10)
    expect(verticalAngle.value).toBe(10)
    handleChangeAngle(angleTypes.VERTICAL)
  })
  it('灯光控制', async () => {
    controlLight(true, lightModes.LOWBEAM)
    await flushPromises()
    expect(patrolingCruise).toHaveBeenCalled()
    currentCar.value = ''
    controlLight(true, lightModes.LOWBEAM)
    expect(lowLight.value).toBe(false)
    controlLight(true, lightModes.HIGHBEAM)
    expect(highLight.value).toBe(false)
    controlLight(true, lightModes.AUTOBEAM)
    expect(autoLight.value).toBe(false)
  })

  it('警报灯控制', async () => {
    vi.mocked(controlAlarmLight as any).mockImplementation(async () => mockingData)
    currentCar.value = '003'
    handleAlarmLight(true)
    await flushPromises()
    expect(controlAlarmLight).toHaveBeenCalled()
    currentCar.value = ''
    handleAlarmLight(true)
    expect(alarmLight.value).toBe(false)
  })
})
