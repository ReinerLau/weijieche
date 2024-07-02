import { hasCoordinate, isTheSameCar } from '@/business/common'
import type { CarInfo } from '@/types'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from '../shared/map/base'

let isRealRouteMode = false
let realRouteLayer: VectorLayer
const realRoutePoints: Marker[] = []

function initRealRouteLayer() {
  if (!realRouteLayer) {
    realRouteLayer = new VectorLayer('real-point')
    realRouteLayer.addTo(map)
  }
}

function clearRealRoute() {
  realRouteLayer.clear()
  realRoutePoints.length = 0
}

export function openRealRouteMode() {
  initRealRouteLayer()
  isRealRouteMode = true
  clearRealRoute()
}

export function closeRealRouteMode() {
  isRealRouteMode = false
  clearRealRoute()
}

export const newRealRoutePoint = (data: CarInfo) => {
  if (hasCoordinate(data) && isTheSameCar(data) && isRealRouteMode) {
    const pathPoint = new Marker([data.longitude, data.latitude])

    realRouteLayer.addGeometry(pathPoint)

    realRoutePoints.push(pathPoint)

    connectNewPoint()
  }
}

function connectNewPoint() {
  if (realRoutePoints.length >= 2) {
    const lastTwoPoints = realRoutePoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: 'yellow',
        lineWidth: 2
      },
      zIndex: -1
    })

    realRouteLayer.addGeometry(connectLine)
  }
}
