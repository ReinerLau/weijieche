import { ref, type Ref } from 'vue'

// 当前选择的车辆编号
export const currentCar = ref('')

// 校验是否已经选择车辆
// export function haveCurrentCar() {
//   if (currentCar.value) {
//     return true
//   } else {
//     ElMessage({ type: 'error', message: t('请选择车辆') })
//     return false
//   }
// }

// 车辆绑定的摄像头数据
export const cameraList: Ref<any[]> = ref([])

// 车辆模式
export const modes = {
  STOP: 1,
  AUTO: 4,
  MANUAL: 3,
  AUTODEBLOCKING: 262144,
  STOPLOCK: 65536
}

// 底盘模式
export const baseModes = {
  AUTO: 129,
  MANUAL: 1,
  STOP: 0
}

//判断车辆切换模式
export const mode = {
  AUTO: 1,
  MANUAL: 2,
  STOP: 0
}

// 当前选择的控制器 id
export const currentController = ref('')

// 当前选择的控制器类型
export const currentControllerType = ref('')

// 控制按过的按键
export const pressedButtons = ref(-1)

// 所有控制器类型
export const controllerTypes = ref({
  WHEEL: '方向盘',
  GAMEPAD: '手柄'
})
