import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'

export const useLight = () => {
  const openFloodingLight = () => {
    const data = {
      code: currentCar.value,
      param1: 7,
      param2: 1,
      param3: 3,
      param4: 255
    }
    if (haveCurrentCar()) {
      patrolingCruise(data)
    }
    return data
  }

  return {
    openFloodingLight
  }
}
