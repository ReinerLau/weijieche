import { ElMessage } from 'element-plus'
import { ref } from 'vue'

export const currentCar = ref('')

export function haveCurrentCar() {
  if (currentCar.value) {
    return true
  } else {
    ElMessage({ type: 'error', message: '请选择车' })
    return false
  }
}
