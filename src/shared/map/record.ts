import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { i18n } from '@/utils'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { clearPathLayer } from './path'
import { clearDrawTool } from './drawTool'
import { haveCurrentCar } from '..'
import { templateDialogVisible } from './template'
import { hasCoordinate, isTheCar, type CarInfo } from './carMarker'

export const isRecord = ref(false)
export const isRecordPath = ref(false)
//录制路线图层实例
export let recordPathLayer: VectorLayer
// 校验地图是否已结束录制路线
export const endRecording = () => {
  if (isRecord.value) {
    ElMessage({
      type: 'error',
      message: i18n.global.t('qing-xian-jie-shu-lu-zhi')
    })
    return false
  } else {
    return true
  }
}

export const initRecordPathLayer = () => {
  recordPathLayer = new VectorLayer('record-point')
  recordPathLayer.addTo(map)
}
export const recordPathPoints: Marker[] = []

export const recordPathToolbarEvent = () => {
  clearPathLayer()
  clearDrawTool()
  if (haveCurrentCar() && !isRecord.value) {
    recordPathPoints.length = 0
    isRecord.value = true
    ElMessage({
      type: 'success',
      message: i18n.global.t('kai-shi-lu-zhi')
    })
    map.removeMenu()
    map.setMenu({
      width: 'auto',
      items: [
        {
          item: i18n.global.t('jie-shu-lu-zhi'),
          click: () => {
            if (recordPathPoints.length > 1) {
              clearPathLayer()
              clearDrawTool()
              isRecord.value = false
              ElMessage({
                type: 'success',
                message: i18n.global.t('yi-jie-shu-lu-zhi-qing-bao-cun-lu-xian')
              })
              isRecordPath.value = true
              templateDialogVisible.value = true
            } else {
              ElMessage({
                type: 'warning',
                message: i18n.global.t('yi-jie-shu-lu-zhi-wei-cun-zai-lu-xian')
              })
              clearPathLayer()
              clearDrawTool()
              isRecord.value = false
              isRecordPath.value = false
              map.removeMenu()
              // initMenu()
            }
          }
        }
      ]
    })
  } else if (isRecord.value) {
    ElMessage({
      type: 'warning',
      message: i18n.global.t('yi-kai-shi-lu-zhi-zhong')
    })
  }
}

export const initRecordPath = (data: CarInfo) => {
  // markerLayer.clear()
  if (hasCoordinate(data) && isTheCar(data) && isRecord.value) {
    const pathPoint = new Marker([data.longitude as number, data.latitude as number], {
      symbol: {
        // markerType: 'ellipse',
        // markerFill: 'red',
        // markerWidth: 13,
        // markerHeight: 13
      }
    })

    recordPathLayer.addGeometry(pathPoint)

    recordPathPoints.push(pathPoint)

    if (recordPathPoints.length >= 2) {
      const lastTwoPoints = recordPathPoints.slice(-2)
      const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
        showOn: 'always',
        symbol: {
          lineColor: 'red',
          lineWidth: 2
        },
        zIndex: -1
      })

      recordPathLayer.addGeometry(connectLine)
    }
  }
}
