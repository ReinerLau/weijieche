import { hasCoordinate, isTheSameCar } from '@/business/common'
import type { CarInfo } from '@/types'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { map } from '../shared/map/base'

export const isReal = ref(false)
//实时路线图层实例
export let realPathLayer: VectorLayer

export const initRealPathLayer = () => {
  realPathLayer = new VectorLayer('real-point')
  realPathLayer.addTo(map)
}

export const realPathPoints: Marker[] = []

export const initRealPath = (data: CarInfo) => {
  if (hasCoordinate(data) && isTheSameCar(data) && isReal.value) {
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
