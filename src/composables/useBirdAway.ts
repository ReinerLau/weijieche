import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { ref } from 'vue'

const disperseMode = ref(false)
export const useBirdAway = () => {
  function controlLaser() {
    disperseMode.value = !disperseMode.value
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '01',
        param2: disperseMode.value ? '01' : '00',
        param3: 255,
        param4: 'ff'
      }
      patrolingCruise(data)
    } else {
      disperseMode.value = false
    }
  }

  return {
    disperseMode,
    controlLaser
  }
}
