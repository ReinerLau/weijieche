import { patrolingSetMode } from '@/api'
import { mode } from '@/shared'
import { useCarStore } from '@/stores/car'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

enum modeKey {
  STOP = 'STOP',
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export const carMode = ref<modeKey>(modeKey.STOP)

export const useControlSection = () => {
  const { t } = useI18n()
  const carStore = useCarStore()

  async function setMode(type: modeKey) {
    carMode.value = modeKey.STOP
    await patrolingSetMode(carStore.currentCar, mode[type])
    ElMessage({ type: 'success', message: t('qie-huan-cheng-gong') })
    carMode.value = type
  }

  return {
    setMode,
    modeKey
  }
}
