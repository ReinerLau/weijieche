import { ref } from 'vue'
import { i18n } from '@/utils'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { hasCoordinate, isTheCar, type CarInfo } from './carMarker'

export const isReal = ref(false)
//实时路线图层实例
export let realPathLayer: VectorLayer

export const initRealPathLayer = () => {
  realPathLayer = new VectorLayer('real-point')
  realPathLayer.addTo(map)
}
export const realPathPoints: Marker[] = []

export const initRealPath = (data: CarInfo) => {
  if (hasCoordinate(data) && isTheCar(data) && isReal.value) {
    const pathPoint = new Marker([data.longitude as number, data.latitude as number], {
      symbol: {
        // markerType: 'ellipse',
        // markerFill: 'red',
        // markerWidth: 13,
        // markerHeight: 13
      }
    })

    realPathLayer.addGeometry(pathPoint)

    realPathPoints.push(pathPoint)

    if (realPathPoints.length >= 2) {
      const lastTwoPoints = realPathPoints.slice(-2)
      const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
        showOn: 'always',
        symbol: {
          lineColor: 'yellow',
          lineWidth: 2
        },
        zIndex: -1
      })

      realPathLayer.addGeometry(connectLine)
    }
  } else {
    return
  }
}
