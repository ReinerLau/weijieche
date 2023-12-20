import { getCarInfo, getCarList } from '@/api'
import { currentCar } from '@/shared'
import { initWebSocket } from '@/utils'
import { ConnectorLine, Map, Marker, VectorLayer } from 'maptalks'
import { watch, ref, onBeforeUnmount, type Ref } from 'vue'
import { isRecord, isRecordPath } from './useMap'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export const useMapMaker = () => {
  // 国际化相关
  const { t } = useI18n()

  // 车辆标记图层
  // https://maptalks.org/maptalks.js/api/1.x/VectorLayer.html
  let markerLayer: VectorLayer
  //录制路线图层实例
  let recordPathLayer: VectorLayer // https://zh.javascript.info/websocket
  let ws: WebSocket | undefined

  // 监听到选择车辆后连接 websocket
  watch(currentCar, (code: string) => {
    addMarker(code)
    tryCloseWS()
    ws = initWebSocket('/websocket/patroling/location', {
      onmessage: updateMarker,
      onopen: () => {
        isConnectedWS.value = true
        ElMessage({
          type: 'success',
          message: t('websocket-lian-jie-cheng-gong')
        })
      },
      onclose: () => {
        isConnectedWS.value = false
        ElMessage({
          type: 'warning',
          message: t('websocket-duan-kai-lian-jie')
        })
      },
      onerror: () => {
        isConnectedWS.value = false
        ElMessage({
          type: 'error',
          message: t('websocket-chu-cuo-duan-lian')
        })
      }
    })
  })

  // 关闭页面前先关闭 websocket
  onBeforeUnmount(tryCloseWS)

  // 关闭 websocket
  function tryCloseWS() {
    if (ws) {
      ws.close()
    }
  }

  // 标记是否已经连接 websocket
  const isConnectedWS = ref(false)
  // 初始化车辆标记图层
  async function initMakerLayer(map: Map) {
    markerLayer = new VectorLayer('marker')
    markerLayer.addTo(map)
    recordPathLayer = new VectorLayer('record-point')
    recordPathLayer.addTo(map)
    initCar()
  }

  //初始化所有车辆标记
  const carList: Ref<{ robotid: string; longitude: number; latitude: number; heading: number }[]> =
    ref([])

  async function initCar() {
    markerLayer.clear()
    const { data } = await getCarList()
    carList.value = data.list || []
    for (const { longitude, latitude, heading } of carList.value) {
      if (longitude && latitude) {
        const point = new Marker([longitude as number, latitude as number], {
          symbol: {
            markerType: 'triangle',
            markerFill: 'yellow',
            markerWidth: 15,
            markerHeight: 20,
            markerRotation: Number(heading)
          }
        })
        markerLayer.addGeometry(point)
      }
    }
  }

  // 车辆信息类型声明
  interface CarInfo {
    robotid?: string
    rid?: string
    longitude?: number | string
    latitude?: number | string
    heading?: number | string
    robotCode?: string
  }

  const recordPathPoints: Marker[] = []

  //录制路线
  function initRecordPath(data: CarInfo) {
    markerLayer.clear()
    if (hasCoordinate(data) && itIsTheCar(data) && isRecord.value) {
      const pathPoint = new Marker([data.longitude as number, data.latitude as number], {
        symbol: {
          markerType: 'ellipse',
          markerFill: 'red',
          markerWidth: 20,
          markerHeight: 20
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

  // 添加车辆标记到图层上
  function initMarker(data: CarInfo) {
    markerLayer.clear()
    if (hasCoordinate(data) && itIsTheCar(data)) {
      const point = new Marker([data.longitude as number, data.latitude as number], {
        symbol: {
          markerType: 'triangle',
          markerFill: 'red',
          markerWidth: 15,
          markerHeight: 20,
          markerRotation: Number(data.heading)
        }
      })
      markerLayer.addGeometry(point)
    }
  }

  // 校验 websocket 拿到的数据是否当前选择车辆的数据
  function itIsTheCar(data: CarInfo) {
    return (
      data.rid === currentCar.value ||
      data.robotid === currentCar.value ||
      data.robotCode === currentCar.value
    )
  }

  // 校验车辆是否有经纬度坐标
  function hasCoordinate(data: CarInfo) {
    return data.longitude && data.latitude
  }

  const newData = ref({})

  // 每次收到新坐标信息更新车辆坐标
  function updateMarker(e: MessageEvent<any>) {
    const data = JSON.parse(e.data)

    initMarker(data)

    //保存车最新数据
    newData.value = data

    // 判断是否开启录制
    if (isRecord.value) {
      initRecordPath(data)
    }
  }
  // 根据车辆编号获取车辆坐标
  async function addMarker(code: string) {
    const res: any = await getCarInfo(code)
    const data = res.data || {}
    isRecord.value = false
    recordPathLayer.clear()
    initMarker(data)
  }

  // 监听是否处于录制状态
  watch(isRecordPath, () => {
    if (!isRecord.value && !isRecordPath.value) {
      recordPathLayer.clear()
      initMarker(newData.value)
    }
  })

  return {
    isConnectedWS,
    initMakerLayer,
    recordPathPoints
  }
}
