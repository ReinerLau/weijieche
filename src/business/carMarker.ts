import { getCarInfo, getCarLog, getPatrolTaskById } from '@/api'
import * as realRoute from '@/business/realRoute'
import type { CarInfo } from '@/types'
import { i18n, initWebSocket } from '@/utils'
import { ElMessage } from 'element-plus'
import { Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { map } from '../shared/map/base'
import {
  initRecordPath,
  initRecordPathLayer,
  isRecord,
  recordPathLayer
} from '../shared/map/record'
import { handleConfirmPatrolTaskPath, taskPathLayer, taskpathPoints } from '../shared/map/taskPath'
import { hasCoordinate, isTheSameCar } from './common'

let carMarkerLayer: VectorLayer
let ws: WebSocket | undefined
export const isConnectedWS = ref(false)

function initCarMarkerLayer() {
  carMarkerLayer = new VectorLayer('marker')
  carMarkerLayer.addTo(map)
}

function tryCloseWS() {
  if (ws) {
    ws.close()
  }
}

export function initMarker(data: CarInfo) {
  carMarkerLayer.clear()
  if (hasCoordinate(data) && isTheSameCar(data)) {
    const point = new Marker([data.longitude, data.latitude], {
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

function updateMarker(e: MessageEvent<any>) {
  if (e.data !== 'heartbeat') {
    const data: CarInfo = JSON.parse(e.data)

    initMarker(data)

    if (isRecord.value) initRecordPath(data)
    if (data.taskStatus === 'start') onTaskStatusStart(data.taskID!)
    if (data.taskStatus === 'end') onTaskStatusEnd()
    if (realRoute.isReal.value) realRoute.initRealPath(data)
  }
}

async function onTaskStatusStart(taskID: number) {
  clearRealPathLayer()
  realRoute.isReal.value = true
  ElMessage.success({
    message: i18n.global.t('kai-shi-zhi-hang-ren-wu')
  })
  const res = await getPatrolTaskById(taskID)
  const route = res.data?.route || []
  handleConfirmPatrolTaskPath(route.value)
}

function onTaskStatusEnd() {
  realRoute.isReal.value = false
  clearRealPathLayer()
  ElMessage.success({
    message: i18n.global.t('ren-wu-zhi-hang-jie-shu')
  })
}

function clearRealPathLayer() {
  realRoute.clearRealRoute()
  taskPathLayer.clear()
  taskpathPoints.length = 0
}

async function initCar() {
  carMarkerLayer.clear()
  const { data } = await getCarLog()
  const carList: CarInfo[] = data?.list || []
  for (const data of carList) {
    if (data.longitude && data.latitude) {
      const point = new Marker([data.longitude, data.latitude], {
        symbol: {
          markerType: 'triangle',
          markerFill: 'yellow',
          markerWidth: 14,
          markerHeight: 16,
          markerRotation: -Number(data.heading)
        }
      })
      carMarkerLayer.addGeometry(point)
    }
  }
}

export async function addMarker(code: string) {
  const { data } = await getCarInfo(code)
  isRecord.value = false
  realRoute.isReal.value = false
  clearRealPathLayer()
  recordPathLayer.clear()
  initMarker(data)
}

export function initMakerLayer() {
  initCarMarkerLayer()
  initRecordPathLayer()
  realRoute.initRealPathLayer()
  initCar()
}

export function onCarPoisition() {
  tryCloseWS()
  ws = initWebSocket('/websocket/patroling/location', {
    onmessage: updateMarker,
    onopen: onOpen,
    onclose: onClose,
    onerror: onError
  })
}

function onOpen() {
  isConnectedWS.value = true
  ElMessage({
    type: 'success',
    message: i18n.global.t('jian-ting-wei-zhi-lian-jie-cheng-gong')
  })
}

function onClose() {
  isConnectedWS.value = false
  ElMessage({
    type: 'warning',
    message: i18n.global.t('jian-ting-wei-zhi-lian-jie-duan-kai')
  })
}

function onError() {
  isConnectedWS.value = false
  ElMessage({
    type: 'error',
    message: i18n.global.t('jian-ting-wei-zhi-lian-jie-cuo-wu')
  })
}
