import { ref, type Ref } from 'vue'
import { initMap } from './map/base'
import { initDrawTool } from './map/drawTool'

/**
 * 车辆绑定的摄像头数据
 */
export const cameraList: Ref<{ id: number; name: string; rtsp: string }[]> = ref([])

/**
 * 车辆模式
 * @property STOP - 停止
 * @property AUTO - 自动
 * @property MANUAL - 手动
 */
export const modes = {
  STOP: 0,
  AUTO: 262144,
  MANUAL: 196608
  // AUTODEBLOCKING: 262144,
  // STOPLOCK: 65536
}

/**
 * 底盘模式
 * @property AUTO - 自动
 * @property MANUAL - 手动
 * @property STOP - 停止
 */
export const baseModes = {
  AUTO: 129,
  MANUAL: 1,
  STOP: 0
}

/**
 * 判断车辆切换模式
 * @property AUTO - 自动
 * @property MANUAL - 手动
 * @property STOP - 停止
 */
export const mode = {
  AUTO: 1,
  MANUAL: 2,
  STOP: 0
}

/**
 * 当前选择的控制器 id
 */
export const currentController = ref('')

/**
 * 当前选择的控制器类型
 */
export const currentControllerType = ref('')

export const pressedButtons = ref(0)
export const pressedTopButton = ref(0)

/**
 * 所有控制器类型
 * @property WHEEL - 方向盘
 * @property GAMEPAD - 手柄
 */
export const controllerTypes = ref({
  WHEEL: '方向盘',
  GAMEPAD: '手柄'
})

/**
 * 当前播放的视频拉流地址
 */
export const cameraUrl = ref('')

// 初始化测试（地图相关）
export const initMapLayerTool = () => {
  const mapEl = document.createElement('div')
  initMap(mapEl)
  initDrawTool()
}
