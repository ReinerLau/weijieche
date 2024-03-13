import { Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { entryPoint, setEntryPoint } from './home'

/**
 * 任务点图层实例
 */
export let taskPointLayer: VectorLayer

export const initTaskPointLayer = () => {
  taskPointLayer = new VectorLayer('task-point')
  taskPointLayer.addTo(map)
}
/**
 * 添加任务点到图层中
 * @param taskPoint
 */
export const addTaskPointToLayer = (taskPoint: Marker) => {
  taskPointLayer.addGeometry(taskPoint)
  if (entryPoint) {
    taskPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
}
