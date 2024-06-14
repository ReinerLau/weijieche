import { patrolingCruise } from '@/api'
import { currentCar } from '@/shared'
import { ref } from 'vue'
import { birStatus } from './useUpperControl'

const disperseMode = ref(false)
const talkBack = ref(false)
export const useBirdAway = () => {
  function controlLaser() {
    disperseMode.value = !disperseMode.value
    const data = {
      code: currentCar.value,
      param1: 7,
      param2: 1,
      param3: disperseMode.value ? 6 : 7,
      param4: 255
    }
    patrolingCruise(data)
  }

  function handleTalkBack() {
    talkBack.value = !talkBack.value
    const data = {
      code: currentCar.value,
      param1: 5,
      param2: talkBack.value ? 1 : 2,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
  }

  async function onClickBirdAway(value: number) {
    const data = {
      code: currentCar.value,
      param1: 6,
      param2: value,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
  }

  async function onClickBirdStatus() {
    const data = {
      code: currentCar.value,
      param1: 6,
      param2: 4,
      param3: 255,
      param4: 255
    }
    await patrolingCruise(data)
    console.log(birStatus.value)
  }

  return {
    disperseMode,
    controlLaser,
    onClickBirdAway,
    handleTalkBack,
    talkBack,
    onClickBirdStatus
  }
}
