import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { ref } from 'vue'
import { entryPoint, setEntryPoint } from './home'
import { i18n } from '@/utils'
import { configCarSpeed } from './pointConfig'

/**
 * 通用路线图层
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export let pathLayer: VectorLayer

/**
 * 路线图层上所有点实例的集合
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export const pathPoints: Marker[] = []

/**
 * 路线图层上所有点实例数据
 */
export const pathPointsData = ref<{ x: number; y: number; speed: string }[]>([])

/**
 * 初始化路线图层
 */
export const initPathLayer = () => {
  pathLayer = new VectorLayer('line')
  pathLayer.addTo(map)
}

/**
 * 清空路线图层
 */
export const clearPathLayer = () => {
  pathLayer.clear()
  pathPoints.length = 0
  pathPointsData.value.length = 0
}

/**
 * 添加路线点到路线图层中
 * @param pathPoint 路线点实例
 */
export const addPathPointToLayer = (pathPoint: Marker) => {
  pathLayer.addGeometry(pathPoint)
  if (entryPoint) {
    pathPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
  pathPoints.push(pathPoint)
  if (pathPoints.length >= 2) {
    const lastTwoPoints = pathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: '#ff930e'
      },
      zIndex: -1
    })
    pathLayer.addGeometry(connectLine)
  }
}

/**
 * 绘制时每次点击点击触发的事件
 * @param e
 */
export const pathPointDrawendEvent = (e: { geometry: Marker }) => {
  const pathPoint = e.geometry
  const index = pathPoints.length
  const pointMenuOptions = {
    items: [
      {
        item: i18n.global.t('she-zhi-che-su'),
        click: () => {
          configCarSpeed(pathPoint, index)
        }
      }
    ]
  }

  pathPoint.config({
    draggable: true
  })
  pathPoint
    .setSymbol({
      textName: pathPoints.length + 1,
      markerType: 'ellipse',
      markerFill: '#ff930e',
      markerWidth: 13,
      markerHeight: 13
    })
    .setMenu(pointMenuOptions)
  addPathPointToLayer(pathPoint)
}