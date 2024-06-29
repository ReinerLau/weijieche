import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const isConfig = ref<boolean>(false)

  const setIsConfig = (value: boolean) => {
    isConfig.value = value
  }

  return { isConfig, setIsConfig }
})
