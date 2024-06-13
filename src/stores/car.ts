import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCarStore = defineStore('car', () => {
  const currentCar = ref<string | undefined>()

  const setCurrentCar = (code: string) => {
    currentCar.value = code
  }

  return { currentCar, setCurrentCar }
})
