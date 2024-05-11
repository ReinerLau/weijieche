import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { debounce } from 'lodash'
import { ref, type Ref } from 'vue'

// 不同功能映射值
export enum keyMap {
  UP = 8,
  LEFT = 4,
  STOP = 255,
  RIGHT = 2,
  DOWN = 16,
  RECALL = 0
}
// 点击触发不同个功能
export function onClickPantilt(param2: number, param3: keyMap) {
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

// 水平角度
export const horizonAngle = ref(0)
// 垂直角度
export const verticalAngle = ref(0)

export const angleTypes = {
  HORIZON: 3,
  VERTICAL: 4
}

// 修改水平角度
export const changeHorizonAngle = createDebouce(angleTypes.HORIZON, horizonAngle)

// 修改垂直角度
export const changeVerticalAngle = createDebouce(angleTypes.VERTICAL, verticalAngle)

// 转换成防抖函数，防止过多调度
export function createDebouce(param2: number, ref: Ref<number>) {
  return debounce(async () => {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 6,
        param2,
        param3: ref.value,
        param4: 0
      }
      patrolingCruise(data)
    }
  }, 500)
}

// 修改角度
export function handleChangeAngle(type: number) {
  if (type === angleTypes.HORIZON) {
    changeHorizonAngle()
  } else if (type === angleTypes.VERTICAL) {
    changeVerticalAngle()
  }
}
