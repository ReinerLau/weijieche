import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import { i18n } from '@/utils'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { clearMenu, map } from './base'
import { clearPathLayer } from './path'
import { clearDrawTool } from './drawTool'
import { haveCurrentCar } from '..'
import { templateDialogVisible } from './template'
import { hasCoordinate, isTheCar, type CarInfo } from './carMarker'
import { clearStatus } from '.'
import * as turf from '@turf/turf'
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
    setRecordMenu()
  } else if (isRecord.value) {
    ElMessage({
      type: 'warning',
      message: i18n.global.t('yi-kai-shi-lu-zhi-zhong')
    })
  }
}

const setRecordMenu = () => {
  clearMenu()
  map.setMenu({
    width: 'auto',
    items: [
      {
        item: i18n.global.t('jie-shu-lu-zhi'),
        click: () => {
          clearMenu()
          if (recordPathPoints.length > 1) {
            clearStatus()
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
            clearStatus()
            isRecord.value = false
            isRecordPath.value = false
          }
        }
      }
    ]
  })
}

let recordData: any = null

export const initRecordPath = (data: CarInfo) => {
  // 筛选绘制保存录制路线
  if (recordData !== null) {
    const line = turf.lineString([
      [recordData.longitude, recordData.latitude],
      [data.longitude, data.latitude]
    ])
    const pointLength = turf.length(line) * 1000
    //两点距离大于1米录制
    if (pointLength > 1) {
      drawRecordPath(data)
    }
  } else {
    drawRecordPath(data)
  }
  // 保存上一个值
  recordData = data
}

function drawRecordPath(data: CarInfo) {
  if (hasCoordinate(data) && isTheCar(data) && isRecord.value) {
    const pathPoint = new Marker([data.longitude as number, data.latitude as number], {})

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

watch(isRecord, () => {
  if (!isRecord.value) {
    recordData = null
  }
})
