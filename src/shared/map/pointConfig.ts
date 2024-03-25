import { computed, ref } from 'vue'
import { pathPointsData } from './path'
import { ElMessage } from 'element-plus'
import { i18n } from '@/utils'
import type { Marker } from 'maptalks'

/**
 * 点编辑抽屉是否可见
 */
export const pointConfigDrawerVisible = ref(false)

/**
 * 当前设置的坐标
 */
export const pointCoordinates = ref('')

/**
 * 当前设置的速度
 */
export const pointSpeed = ref('5')

/**
 * 回显坐标和速度
 * @param coordinates 坐标
 * @param speed 速度
 */
export const handlePointConfigEvent = (coordinates: { x: number; y: number }, speed: string) => {
  pointCoordinates.value = JSON.stringify(coordinates)
  pointSpeed.value = speed
}

/**
 * 当前选择的点顺序，从 0 开始算
 */
export const currentSelectedPointIndex = ref(0)

/**
 * 设置点速度
 * @param speed 速度
 */
export const handleConfirmPointCarConfig = (speed: string) => {
  if (pathPointsData.value.length !== 0) {
    pathPointsData.value[currentSelectedPointIndex.value].speed = speed
  } else {
    ElMessage.error({
      message: i18n.global.t('lu-xian-bu-cun-zai-qing-you-jian-jie-shu-hua-xian')
    })
  }
}

/**
 * 设置点车速
 * @param pathPoint 当前点实例
 * @param index 当前点索引
 */
export const configCarSpeed = (pathPoint: Marker, index: number) => {
  const pointCoordinates = {
    x: pathPoint.getCoordinates().y,
    y: pathPoint.getCoordinates().x
  }
  currentSelectedPointIndex.value = index
  const speed = carSpeedData.value[currentSelectedPointIndex.value] || ''
  pointConfigDrawerVisible.value = true
  handlePointConfigEvent(pointCoordinates, speed)
}

/**
 * 已存速度集合
 */
export const carSpeedData = computed(() => pathPointsData.value.map((item) => item.speed))
