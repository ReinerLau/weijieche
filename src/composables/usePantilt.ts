import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'

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
    Type
  }
}
