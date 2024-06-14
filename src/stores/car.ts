import type { Car } from '@/types'
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

  return { currentCar, setCurrentCar, carList, setCarList }
})
