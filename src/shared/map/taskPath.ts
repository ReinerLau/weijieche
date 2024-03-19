import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { clearMenu, jumpToCoordinate, map } from './base'
import { clearDrawTool } from './drawTool'
import { clearPathLayer } from './path'

/**
 * 下发任务路线图层实例
 */
export let taskPathLayer: VectorLayer

/**
 * 初始化下发任务路线图层
 */
export const initTaskpathLayer = () => {
  taskPathLayer = new VectorLayer('task-path')
  taskPathLayer.addTo(map)
}

/**
 * 下发任务路线点实例集合
 */
export const taskpathPoints: Marker[] = []
/**
 * 添加下发任务路线到图层中
 * @param pathPoint 点实例
 */
export const addTaskPathPointToLayer = (pathPoint: Marker) => {
  taskPathLayer.addGeometry(pathPoint)
  taskpathPoints.push(pathPoint)

  if (taskpathPoints.length >= 2) {
    const lastTwoPoints = taskpathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: '#F096BC'
      },
      zIndex: -1
    })
    taskPathLayer.addGeometry(connectLine)
  }
}

export const taskPathPointArray: { x: number; y: number }[] = []

/**
 * 任务开始后显示路线在地图上
 * @param route 路线数据
 */
export const handleConfirmPatrolTaskPath = (route: { x: number; y: number }[]) => {
  taskPathPointArray.length = 0
  clearDrawTool()
  clearPathLayer()
  clearMenu()
  const coordinates: number[][] = route.map((item) => [item.y, item.x])
  coordinates.forEach((coordinate) => {
    const pathPoint = new Marker(coordinate, {
      symbol: {
        markerType: 'ellipse',
        markerFill: '#F096BC',
        markerWidth: 13,
        markerHeight: 13
      }
    })

    addTaskPathPointToLayer(pathPoint)

    const pointCoordinates = {
      x: pathPoint.getCoordinates().y,
      y: pathPoint.getCoordinates().x
    }
    taskPathPointArray.push(pointCoordinates)
  })
  jumpToCoordinate(taskPathPointArray[0].y, taskPathPointArray[0].x)
}
