import { hasCoordinate, isTheSameCar } from '@/business/common'
import type { CarInfo } from '@/types'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from '../shared/map/base'

let isRealMode = false
let realPathLayer: VectorLayer
const realPathPoints: Marker[] = []

export const initRealPathLayer = () => {
  realPathLayer = new VectorLayer('real-point')
  realPathLayer.addTo(map)
}

function clearRealRoute() {
  realPathLayer.clear()
  realPathPoints.length = 0
}

export function openRealRouteMode() {
  isRealMode = true
  clearRealRoute()
}

export function closeRealRouteMode() {
  isRealMode = false
  clearRealRoute()
}

export const initRealPath = (data: CarInfo) => {
  if (hasCoordinate(data) && isTheSameCar(data) && isRealMode) {
    const pathPoint = new Marker([data.longitude, data.latitude])

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
  }
}
