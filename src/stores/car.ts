import type { Car } from '@/types'
import { i18n } from '@/utils'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCarStore = defineStore('car', () => {
  const currentCar = ref<string | undefined>()
  const carList = ref<Car[]>([])

  const setCurrentCar = (code: string) => {
    currentCar.value = code
  }

  const setCarList = (list: Car[]) => {
    carList.value = list
  }

  const haveCurrentCar = () => {
    if (currentCar.value) {
      return true
    } else {
      ElMessage({ type: 'error', message: i18n.global.t('qing-xuan-ze-che-liang') })
      return false
    }
  }

  return { currentCar, setCurrentCar, carList, setCarList, haveCurrentCar }
})
