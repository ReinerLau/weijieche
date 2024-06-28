import { patrolingCruise } from '@/api'
import { useCarStore } from '@/stores/car'

export const useDisperse = () => {
  const carStore = useCarStore()
  const toggleDisperse = (isOpen: boolean) => {
    const data = {
      code: carStore.currentCar,
      param1: 6,
      param2: isOpen ? 1 : 3,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
    return data
  }

  return {
    toggleDisperse
  }
}
