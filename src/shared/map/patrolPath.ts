import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { entryPoint, setEntryPoint } from './home'

/**
 * 巡逻路线图层实例
 */
export let patrolpathLayer: VectorLayer

/**
 * 初始化巡逻路线图层
 */
export const initPatrolpathLayer = () => {
  patrolpathLayer = new VectorLayer('patrol')
  patrolpathLayer.addTo(map)
}

/**
 * 清空巡逻路线
 */
export const clearDrawPatrolLine = () => {
  patrolpathLayer.clear()
  patrolpathPoints.length = 0
}

/**
 * 巡逻路线点实例集合
 */
export const patrolpathPoints: Marker[] = []
/**
 * 添加巡逻路线到图层中
 * @param pathPoint 点实例
 */
export const addPatrolPathPointToLayer = (pathPoint: Marker) => {
  patrolpathLayer.addGeometry(pathPoint)
  if (entryPoint) {
    pathPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
  patrolpathPoints.push(pathPoint)
  if (patrolpathPoints.length >= 2) {
    const lastTwoPoints = patrolpathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: '#DC00FE'
      },
      zIndex: -1
    })
    patrolpathLayer.addGeometry(connectLine)
  }
}

export const pathPointArray: { x: number; y: number }[] = []
