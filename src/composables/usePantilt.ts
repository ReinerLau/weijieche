import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { ref, watch } from 'vue'

// 不同功能映射值
enum Type {
  STOP = 0,
  UP = 3,
  LEFT = 2,
  RIGHT = 1,
  DOWN = 4,
  RESET = 6,
  RECALL = 7,
  INITIAL = 9
}

export const usePantilt = () => {
  const horizonSpeed = ref(0)

  const verticalSpeed = ref(0)
  // 水平角度
  const horizonAngle = ref(0)
  // 垂直角度
  const verticalAngle = ref(0)
  const pantiltX = ref(2048)
  const pantiltY = ref(2048)

  // const updateLeft = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.LEFT), 500)
  // const updateRight = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.RIGHT), 500)
  // const updateUp = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.UP), 500)
  // const updateDown = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.DOWN), 500)

  // let raf: number

  const startUpdateX = () => {
    if (pantiltX.value === 0) {
      // updateLeft()
      onClickPantilt(Type.LEFT, horizonSpeed.value)
    } else if (pantiltX.value === 4095) {
      // updateRight()
      onClickPantilt(Type.RIGHT, horizonSpeed.value)
    } else {
      // cancelAnimationFrame(raf)
      return
    }
    // raf = requestAnimationFrame(startUpdateX)
  }

  const startUpdateY = () => {
    if (pantiltY.value === 0) {
      // updateDown()
      onClickPantilt(Type.DOWN, verticalSpeed.value)
    } else if (pantiltY.value === 4095) {
      // updateUp()
      onClickPantilt(Type.UP, verticalSpeed.value)
    } else {
      // cancelAnimationFrame(raf)
      return
    }
    // raf = requestAnimationFrame(startUpdateY)
  }

  watch(pantiltX, startUpdateX)

  watch(pantiltY, startUpdateY)

  function onClickPantilt(param2: number, param3: string | number) {
    if (haveCurrentCar()) {
      if (param2 === Type.RESET) {
        horizonAngle.value = 0
        verticalAngle.value = -20
      } else if (param2 === Type.RECALL) {
        horizonAngle.value = 0
        verticalAngle.value = 0
      }
      const data = {
        code: currentCar.value,
        param1: 3,
        param2,
        param3,
        param4: 255
      }
      patrolingCruise(data)
    }
  }

  return {
    onClickPantilt,
    Type,
    pantiltX,
    pantiltY,
    horizonSpeed,
    verticalSpeed,
    horizonAngle,
    verticalAngle
  }
}
