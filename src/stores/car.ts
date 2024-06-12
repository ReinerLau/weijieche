import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCarStore = defineStore('car', () => {
  const currentCar = ref<string | null>(null)

  return { currentCar }
})
