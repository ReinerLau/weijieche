import { patrolingCruise } from '@/api'
import { useCarStore } from '@/stores/car'
import { ref, watch } from 'vue'

// 不同功能映射值
enum PantiltMode {
  STOP = 0,
  UP = 3,
  LEFT = 2,
  RIGHT = 1,
  DOWN = 4,
  RESET = 6,
  RECALL = 7,
  INITIAL = 9
}
export const horizonSpeed = ref(5)

export const verticalSpeed = ref(5)
// 水平角度
export const horizonAngle = ref(0)
// 垂直角度
export const verticalAngle = ref(0)
export const usePantilt = () => {
  const pantiltX = ref(2048)
  const pantiltY = ref(2048)

  const carStore = useCarStore()

  // const updateLeft = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.LEFT), 500)
  // const updateRight = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.RIGHT), 500)
  // const updateUp = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.UP), 500)
  // const updateDown = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.DOWN), 500)

  // let raf: number

  const startUpdateX = () => {
    if (pantiltX.value === 0) {
      onClickPantilt(PantiltMode.LEFT, horizonSpeed.value)
    } else if (pantiltX.value === 4095) {
      onClickPantilt(PantiltMode.RIGHT, horizonSpeed.value)
    } else if (pantiltX.value === 2048) {
      onClickPantilt(PantiltMode.STOP, 255)
    } else {
      return
    }
  }

  const startUpdateY = () => {
    if (pantiltY.value === 0) {
      onClickPantilt(PantiltMode.DOWN, verticalSpeed.value)
    } else if (pantiltY.value === 4095) {
      onClickPantilt(PantiltMode.UP, verticalSpeed.value)
    } else if (pantiltY.value === 2048) {
      onClickPantilt(PantiltMode.STOP, 255)
    } else {
      return
    }
  }

  watch(pantiltX, startUpdateX)

  watch(pantiltY, startUpdateY)

  function onClickPantilt(param2: number, param3?: string | number) {
    if (param2 === PantiltMode.RESET) {
      horizonAngle.value = 0
      verticalAngle.value = -20
    } else if (param2 === PantiltMode.RECALL) {
      horizonAngle.value = 0
      verticalAngle.value = 0
    }
    const data = {
      code: carStore.currentCar,
      param1: 3,
      param2,
      param3,
      param4: 255
    }
    patrolingCruise(data)
  }

  return {
    onClickPantilt,
    PantiltMode,
    pantiltX,
    pantiltY,
    horizonSpeed,
    verticalSpeed,
    horizonAngle,
    verticalAngle
  }
}
