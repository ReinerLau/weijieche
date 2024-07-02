import { hasCoordinate } from '@/business/common'
import type { CarInfo } from '@/types'
import { ConnectorLine, Map, Marker, VectorLayer } from 'maptalks'

export const layerId = 'real-route'

export class RealRoute {
  private _mode = false
  private _layer: VectorLayer = new VectorLayer(layerId)
  private _points: Marker[] = []
  initLayer(map: Map) {
    if (!map.getLayer(layerId)) {
      map.addLayer(this._layer)
    }
  }
  openMode(map: Map) {
    this._mode = true
    this.initLayer(map)
  }
  closeMode() {
    this._mode = false
    this.clear()
  }
  clear() {
    this._layer.clear()
    this._points.length = 0
  }
  newPoint(data: CarInfo) {
    if (hasCoordinate(data) && this._mode) {
      const pathPoint = new Marker([data.longitude, data.latitude])
      this._layer.addGeometry(pathPoint)
      this._points.push(pathPoint)
      this.connectPoint()
    }
  }
  connectPoint() {
    if (this._points.length >= 2) {
      const lastTwoPoints = this._points.slice(-2)
      const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
        showOn: 'always',
        symbol: {
          lineColor: 'yellow',
          lineWidth: 2
        },
        zIndex: -1
      })

      this._layer.addGeometry(connectLine)
    }
  }
  get mode() {
    return this._mode
  }
  get pointCount() {
    return this._points.length
  }

  get layerGeometriesCount() {
    return this._layer.getGeometries().length
  }
}

export const realRoute = new RealRoute()
