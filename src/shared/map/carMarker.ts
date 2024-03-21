import { Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { currentCar } from '..'
import { ref } from 'vue'
import { initRecordPath, initRecordPathLayer, isRecord, recordPathLayer } from './record'
import { getCarInfo, getCarList, getPatrolTaskById } from '@/api'
import { i18n, initWebSocket } from '@/utils'
import { ElMessage } from 'element-plus'
import { initRealPath, initRealPathLayer, isReal, realPathLayer, realPathPoints } from './realRoute'
import { handleConfirmPatrolTaskPath, taskPathLayer, taskpathPoints } from './taskPath'

export let carMarkerLayer: VectorLayer
export let ws: WebSocket | undefined

export const initCarMarkerLayer = () => {
  carMarkerLayer = new VectorLayer('marker')
  carMarkerLayer.addTo(map)
}

export const setWS = (val: WebSocket) => {
  ws = val
}

export interface CarInfo {
  robotid?: string
  rid?: string
  longitude: number
  latitude: number
  heading?: number | string
  robotCode?: string
}

// 校验车辆是否有经纬度坐标
export const hasCoordinate = (data: CarInfo) => {
  return data.longitude && data.latitude
}

export const isTheCar = (data: CarInfo) => {
  return (
    data.rid === currentCar.value ||
    data.robotid === currentCar.value ||
    data.robotCode === currentCar.value
  )
}
// 关闭 websocket
export const tryCloseWS = () => {
  if (ws) {
    ws.close()
  }
}

// 标记是否已经连接 websocket
export const isConnectedWS = ref(false)

export const initMarker = (data: CarInfo) => {
  carMarkerLayer.clear()
  if (hasCoordinate(data) && isTheCar(data)) {
    const point = new Marker([data.longitude as number, data.latitude as number], {
      symbol: {
        markerType: 'triangle',
        markerFill: 'red',
        markerWidth: 14,
        markerHeight: 16,
        markerRotation: -Number(data.heading)
      }
    })
    carMarkerLayer.addGeometry(point)
  }
}

export const newCarData = ref()

export const updateMarker = async (e: MessageEvent<any>) => {
  if (e.data !== 'heartbeat') {
    const data = JSON.parse(e.data)
    if (data.latitude && data.longitude) {
      //保存车最新数据
      newCarData.value = data
    }

    initMarker(data)

    // 判断是否开启录制
    if (isRecord.value) {
      initRecordPath(data)
    }

    if (data.taskStatus === 'start') {
      clearRealPathLayer()
      initMarker(newCarData.value)
      isReal.value = true
      ElMessage.success({
        message: i18n.global.t('kai-shi-zhi-hang-ren-wu')
      })
      const route = ref<any[]>([])
      const res = await getPatrolTaskById(data.taskID)
      route.value = res.data?.route || []
      handleConfirmPatrolTaskPath(route.value)
    }
    if (data.taskStatus === 'end') {
      isReal.value = false
      clearRealPathLayer()
      ElMessage.success({
        message: i18n.global.t('ren-wu-zhi-hang-jie-shu')
      })
      initMarker(newCarData.value)
    }

    if (isReal.value) {
      initRealPath(data)
    }
  }
}

export const clearRealPathLayer = () => {
  realPathLayer.clear()
  taskPathLayer.clear()
  taskpathPoints.length = 0
  realPathPoints.length = 0
}

export const carList = ref<
  { robotid: string; longitude: number; latitude: number; heading: number }[]
>([])

export const initCar = async () => {
  carMarkerLayer.clear()
  const { data } = await getCarList()
  carList.value = data?.list || []
  for (const { longitude, latitude, heading } of carList.value) {
    if (longitude && latitude) {
      const point = new Marker([longitude as number, latitude as number], {
        symbol: {
          markerType: 'triangle',
          markerFill: 'yellow',
          markerWidth: 14,
          markerHeight: 16,
          markerRotation: -Number(heading)
        }
      })
      carMarkerLayer.addGeometry(point)
    }
  }
}

// 根据车辆编号获取车辆坐标
export const addMarker = async (code: string) => {
  const res: any = await getCarInfo(code)
  const data = res.data || {}
  isRecord.value = false
  isReal.value = false
  clearRealPathLayer()
  recordPathLayer.clear()
  newCarData.value = data
  initMarker(data)
}
// 初始化车辆标记图层
export const initMakerLayer = () => {
  initCarMarkerLayer()
  initRecordPathLayer()
  initRealPathLayer()
  initCar()
}

export const onCarPoisition = () => {
  ws = initWebSocket('/websocket/patroling/location', {
    onmessage: updateMarker,
    onopen: () => {
      isConnectedWS.value = true
      ElMessage({
        type: 'success',
        message: i18n.global.t('jian-ting-wei-zhi-lian-jie-cheng-gong')
      })
    },
    onclose: () => {
      isConnectedWS.value = false
      ElMessage({
        type: 'warning',
        message: i18n.global.t('jian-ting-wei-zhi-lian-jie-duan-kai')
      })
    },
    onerror: () => {
      isConnectedWS.value = false
      ElMessage({
        type: 'error',
        message: i18n.global.t('jian-ting-wei-zhi-lian-jie-cuo-wu')
      })
    }
  })
}
