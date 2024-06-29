import { patrolingCruise } from '@/api'
import { useCarStore } from '@/stores/car'

export const useLight = () => {
  const carStore = useCarStore()
  const openFloodingLight = () => {
    const data = {
      code: carStore.currentCar,
      param1: 7,
      param2: 1,
      param3: 3,
      param4: 255
    }
    patrolingCruise(data)
    return data
  }

  const toggleAlarmLight = (isOpen: boolean) => {
    const data = {
      code: carStore.currentCar,
      param1: 8,
      param2: isOpen ? 1 : 0,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
    return data
  }

  return {
    openFloodingLight,
    toggleAlarmLight
  }
}
