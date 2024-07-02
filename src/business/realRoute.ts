import { hasCoordinate, isTheSameCar } from '@/business/common'
import type { CarInfo } from '@/types'
import { ConnectorLine, Map, Marker, VectorLayer } from 'maptalks'
import { map } from '../shared/map/base'

export const layerId = 'real-route'

export class RealRoute {
  private _realRouteLayer: VectorLayer = new VectorLayer(layerId)
  initRealRouteLayer(map: Map) {
    map.addLayer(this._realRouteLayer)
  }
}

let realRouteMode = false
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
  realRouteMode = true
  clearRealRoute()

  return {
    realRouteMode,
    layerGeometriesCount: realRouteLayer.getGeometries().length,
    pointCount: realRoutePoints.length
  }
}

export function closeRealRouteMode() {
  realRouteMode = false
  clearRealRoute()

  return {
    realRouteMode,
    layerGeometriesCount: realRouteLayer.getGeometries().length,
    pointCount: realRoutePoints.length
  }
}

export const newRealRoutePoint = (data: CarInfo) => {
  if (hasCoordinate(data) && isTheSameCar(data) && realRouteMode) {
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
