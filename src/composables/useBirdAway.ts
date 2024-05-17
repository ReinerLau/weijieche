import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { ref } from 'vue'

const disperseMode = ref(false)
const talkBack = ref(false)
export const useBirdAway = () => {
  function controlLaser() {
    disperseMode.value = !disperseMode.value
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 7,
        param2: 1,
        param3: disperseMode.value ? 6 : 7,
        param4: 255
      }
      patrolingCruise(data)
    } else {
      disperseMode.value = false
    }
  }

  function handleTalkBack() {
    talkBack.value = !talkBack.value
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 5,
        param2: talkBack.value ? 1 : 2,
        param3: 255,
        param4: 255
      }
      patrolingCruise(data)
    } else {
      disperseMode.value = false
    }
  }

  async function onClickBirdAway(value: number) {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 6,
        param2: value,
        param3: 255,
        param4: 255
      }
      patrolingCruise(data)
    }
  }

  return {
    disperseMode,
    controlLaser,
    onClickBirdAway,
    handleTalkBack,
    talkBack
  }
}
