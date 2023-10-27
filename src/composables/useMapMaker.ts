import { getCarInfo } from '@/api'
import { currentCar } from '@/shared'
import { initWebSocket } from '@/utils'
import { Map, Marker, VectorLayer } from 'maptalks'
import { watch, ref, onBeforeUnmount } from 'vue'

export const useMapMaker = () => {
  let markerLayer: VectorLayer
  let ws: WebSocket | undefined

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

  onBeforeUnmount(tryCloseWS)

  function tryCloseWS() {
    if (ws) {
      ws.close()
    }
  }

  const isConnectedWS = ref(false)

  function initMakerLayer(map: Map) {
    markerLayer = new VectorLayer('marker')
    markerLayer.addTo(map)
  }

  interface CarInfo {
    robotid?: string
    rid?: string
    longitude?: number
    latitude?: number
    heading?: number
  }

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

  function itIsTheCar(data: CarInfo) {
    return data.rid === currentCar.value || data.robotid === currentCar.value
  }

  function hasCoordinate(data: CarInfo) {
    return data.longitude && data.latitude
  }

  function updateMarker(e: MessageEvent<any>) {
    const data = JSON.parse(e.data)
    initMarker(data)
  }

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
