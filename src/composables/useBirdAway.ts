import { patrolingCruise, playAudioById } from '@/api'
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

  async function onClickBirdAway(value: string) {
    if (haveCurrentCar()) {
      if (value === '9' || value === '10') {
        playAudioById(parseInt(value))
      } else {
        const data = {
          code: currentCar.value,
          param1: '05',
          param2: value,
          param3: '0',
          param4: '0'
        }
        patrolingCruise(data)
      }
    }
  }

  return {
    disperseMode,
    controlLaser,
    onClickBirdAway
  }
}
