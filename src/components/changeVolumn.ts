import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { volume } from './BirdAwayControl.vue'

export const changeVolumn = debounce(async () => {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: '05',
      param2: '04',
      param3: volume.value,
      param4: 'ff'
    }
    patrolingCruise(data)
  }
}, 500)
