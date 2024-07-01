import type { CarInfo } from '@/business/carMarker'
import { i18n } from '@/utils'
import { length, lineString } from '@turf/turf'
import { ElMessage } from 'element-plus'
import { LineString, Marker, VectorLayer } from 'maptalks'
import { computed, ref, watch } from 'vue'
import { clearStatus } from '.'
import { clearMenu, map } from './base'
import { hasCoordinate, isTheCar } from './carMarker'
import { clearDrawTool } from './drawTool'
import { clearPathLayer } from './path'
import { templateDialogVisible } from './template'
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

  if (!isRecord.value) {
    recordPathPoints.length = 0
    recordPath.value.length = 0
    allRecordSum.value = 0
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

const endRecordPath = () => {
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

export const recordMenu = [
  {
    item: i18n.global.t('jie-shu-lu-zhi'),
    click: endRecordPath
  }
]
export const allRecordSum = ref(0)

const setRecordMenu = () => {
  clearMenu()
  map.setMenu({
    width: 'auto',
    items: recordMenu
  })
}

export let recordData: any = null

export const setRecordDataValue = (val: any) => {
  recordData = val
}

export const initRecordPath = (data: CarInfo) => {
  allRecordSum.value++

  // 筛选绘制保存录制路线
  if (recordData !== null) {
    const line = lineString([
      [recordData.longitude, recordData.latitude],
      [data.longitude, data.latitude]
    ])
    const pointLength = length(line) * 1000
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

export const filterRecordSum = computed(() => {
  return recordPath.value.length
})

export const recordPath = ref<[number, number][]>([])
export function drawRecordPath(data: CarInfo) {
  if (hasCoordinate(data) && isTheCar(data) && isRecord.value) {
    const pathPoint = new Marker([data.longitude as number, data.latitude as number])
    recordPath.value.push([Number(data.longitude), Number(data.latitude)])
    recordPathPoints.push(pathPoint)
    const connectLine = new LineString(recordPath.value, {
      symbol: {
        lineColor: 'red'
      }
    })
    recordPathLayer.addGeometry(connectLine)
  }
}

watch(isRecord, () => {
  if (!isRecord.value) {
    recordData = null
  }
})
