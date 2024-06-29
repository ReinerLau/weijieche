import { controlAlarmLight, patrolingCruise } from '@/api'
import { useCarStore } from '@/stores/car'
import { ref } from 'vue'

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
  const carStore = useCarStore()
  const data = {
    code: carStore.currentCar,
    param1: 6,
    param2,
    param3,
    param4: 0
  }
  patrolingCruise(data)
}

// 水平角度
export const horizonAngle = ref(0)
// 垂直角度
export const verticalAngle = ref(0)

export const angleTypes = {
  HORIZON: 3,
  VERTICAL: 4
}

// 近远灯映射值
export const lightModes = {
  HIGHBEAM: '01',
  LOWBEAM: '02',
  AUTOBEAM: '03'
}

// 近灯是否开启
export const lowLight = ref(false)

// 远灯是否开启
export const highLight = ref(false)

//自动灯是否开启
export const autoLight = ref(false)

//警告灯是否开启
export const alarmLight = ref(false)

export function controlLight(value: boolean, type: string) {
  toggleLight(value, type)
}

// 切换近远灯相关事件
export function toggleLight(value: boolean, mode: string) {
  const carStore = useCarStore()
  const data = {
    code: carStore.currentCar,
    param1: '07',
    param2: value ? mode : '00',
    param3: 255,
    param4: 255
  }
  patrolingCruise(data)
}

export function handleAlarmLight(value: boolean) {
  const carStore = useCarStore()
  const data = {
    code: carStore.currentCar,
    type: value ? '1' : '0'
  }
  controlAlarmLight(data)
}
