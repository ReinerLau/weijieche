import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'

export const useDisperse = () => {
  const toggleDisperse = (isOpen: boolean) => {
    const data = {
      code: currentCar.value,
      param1: 6,
      param2: isOpen ? 1 : 3,
      param3: 255,
      param4: 255
    }
    if (haveCurrentCar()) {
      patrolingCruise(data)
    }
    return data
  }

  return {
    toggleDisperse
  }
}
