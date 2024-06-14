import { getCarList } from '@/api/list'
import { useCarStore } from '@/stores/car'
import { i18n } from '@/utils'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

export const useCarDialog = () => {
  const carStore = useCarStore()

  const visible = ref(true)

  const getList = async () => {
    const { data } = await getCarList('patroling')
    carStore.setCarList(data || [])
  }

  const confirmIt = () => {
    if (carStore.currentCar) {
      visible.value = false
    } else {
      ElMessage({ type: 'error', message: i18n.global.t('qing-xuan-ze-che-liang') })
    }
  }

  return {
    visible,
    confirmIt,
    getList
  }
}
