import { Marker, VectorLayer } from 'maptalks'
import { map } from './base'

/**
 * 通用路线图层
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export let pathLayer: VectorLayer

/**
 * 路线图层上所有点的集合
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export const pathPoints: Marker[] = []

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
}
