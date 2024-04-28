import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { throttle } from 'lodash'
import { ref, watch } from 'vue'

// 不同功能映射值
enum keyMap {
  UP = 8,
  LEFT = 4,
  STOP = 255,
  RIGHT = 2,
  DOWN = 16,
  RECALL = 0
}
enum Type {
  DIRECTION = 5,
  RECALL = 6
}

export const usePantilt = () => {
  const pantiltX = ref(2048)
  const pantiltY = ref(2048)

  const updateLeft = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.LEFT), 500)
  const updateRight = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.RIGHT), 500)
  const updateUp = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.UP), 500)
  const updateDown = throttle(() => onClickPantilt(Type.DIRECTION, keyMap.DOWN), 500)

  let raf: number

  const startUpdateX = () => {
    if (pantiltX.value === 0) {
      updateLeft()
    } else if (pantiltX.value === 4095) {
      updateRight()
    } else {
      cancelAnimationFrame(raf)
      return
    }
    raf = requestAnimationFrame(startUpdateX)
  }

  const startUpdateY = () => {
    if (pantiltY.value === 0) {
      updateDown()
    } else if (pantiltY.value === 4095) {
      updateUp()
    } else {
      cancelAnimationFrame(raf)
      return
    }
    raf = requestAnimationFrame(startUpdateY)
  }

  watch(pantiltX, startUpdateX)

  watch(pantiltY, startUpdateY)

  function onClickPantilt(param2: number, param3: keyMap) {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 6,
        param2,
        param3,
        param4: 0
      }
      patrolingCruise(data)
    }
  }

  return {
    onClickPantilt,
    keyMap,
    Type,
    pantiltX,
    pantiltY
  }
}
