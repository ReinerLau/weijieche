import { i18n } from '@/utils'
import { Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { map } from './base'
import { clearDrawTool } from './drawTool'
import { entryPoint, setEntryPoint } from './home'
import { clearPathLayer } from './path'
import { patrolTaskDialogVisible } from './patrolPath'
/**
 * 异常位置图层实例
 */
export let alarmPointLayer: VectorLayer

/**
 * 初始化异常位置图层
 */
export const initAlarmPointLayer = () => {
  alarmPointLayer = new VectorLayer('alarm-point')
  alarmPointLayer.addTo(map)
}

/**
 * 清空异常位置
 */
export const clearDrawAlarmPoint = () => {
  alarmPointLayer.clear()
  alarmPoints.length = 0
}

/**
 * 异常位置点实例集合
 */
export const alarmPoints: Marker[] = []
/**
 * 添加异常位置点到图层中
 * @param alarmPoint 点实例
 */

export const addAlarmPointToLayer = (alarmPoint: Marker) => {
  alarmPointLayer.addGeometry(alarmPoint)
  if (entryPoint) {
    alarmPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
}

/**
 * 选择异常位置按钮后显示路线在地图上
 * @param data 单条异常位置数据
 */

export const alarmPointMenuItems = (data: any, index: number) => {
  return [
    {
      item: i18n.global.t('cha-kan-xiang-qing'),
      click: () => {
        showMoreAlarm(data, index)
      }
    }
  ]
}
export const alarmMessageData: any = ref({})
export const handleConfirmAlarmPoint = (data: any) => {
  clearDrawTool()
  clearPathLayer()
  clearDrawAlarmPoint()
  const coordinates: number[][] = data.map((item: any) => [item.longitude, item.latitude])
  coordinates.forEach((coordinate) => {
    const alarmPoint = new Marker(coordinate, {
      symbol: {
        // textName: index + 1,
        markerType: 'ellipse',
        markerFill: '#F4DEA4',
        markerWidth: 13,
        markerHeight: 13
      }
    })

    alarmPoints.push(alarmPoint)
    alarmPoints.forEach((alarmPoint, index) => {
      alarmPoint.setMenuItems(alarmPointMenuItems(data, index))
    })

    addAlarmPointToLayer(alarmPoint)
  })

  patrolTaskDialogVisible.value = false
}

export const showAlarmDialogVisible = ref(false)

export const showMoreAlarm = (data: any, index: number) => {
  showAlarmDialogVisible.value = true
  alarmMessageData.value = data[index]
}
