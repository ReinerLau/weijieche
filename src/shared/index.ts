import { getCameraListByCode } from '@/api'
import { ElMessage } from 'element-plus'
import { ref, watch, type Ref } from 'vue'

export const currentCar = ref('')

export function haveCurrentCar() {
  if (currentCar.value) {
    return true
  } else {
    ElMessage({ type: 'error', message: '请选择车' })
    return false
  }
}

export const cameraList: Ref<any[]> = ref([])
watch(currentCar, async () => {
  const res = await getCameraListByCode(currentCar.value, 'patroling')
  cameraList.value = res.data
})

export const modes = {
  STOP: 1,
  AUTO: 4,
  MANUAL: 3
}

export const baseModes = {
  AUTO: 129,
  MANUAL: 1,
  STOP: 0
}
