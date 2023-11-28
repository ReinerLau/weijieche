import { getCarInfo, getCarList } from '@/api'
import { currentCar } from '@/shared'
import { initWebSocket } from '@/utils'
import { Map, Marker, VectorLayer } from 'maptalks'
import { watch, ref, onBeforeUnmount, type Ref } from 'vue'

export const useMapMaker = () => {
  // 车辆标记图层
  // https://maptalks.org/maptalks.js/api/1.x/VectorLayer.html
  let markerLayer: VectorLayer

  // https://zh.javascript.info/websocket
  let ws: WebSocket | undefined

  // 监听到选择车辆后连接 websocket
  watch(currentCar, (code: string) => {
    addMarker(code)
    tryCloseWS()
    ws = initWebSocket('/websocket/patroling/location', {
      onmessage: updateMarker,
      onopen: () => {
        isConnectedWS.value = true
      },
      onclose: () => {
        isConnectedWS.value = false
      },
      onerror: () => {
        isConnectedWS.value = false
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
            markerRotation: heading
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
    longitude?: number
    latitude?: number
    heading?: number
    robotCode?: string
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
          markerRotation: data.heading
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

  // 每次收到新坐标信息更新车辆坐标
  function updateMarker(e: MessageEvent<any>) {
    const data = JSON.parse(e.data)
    initMarker(data)
  }

  // 根据车辆编号获取车辆坐标
  async function addMarker(code: string) {
    const res: any = await getCarInfo(code)
    const data = res.data || {}
    initMarker(data)
  }

  return {
    isConnectedWS,
    initMakerLayer
  }
}
