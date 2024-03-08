import { VectorLayer } from 'maptalks'
import { map } from './base'

/**
 * 警报图层
 */
export let alarmMarkerLayer: VectorLayer

/**
 * 初始化警报图层
 */
export const initAlarmMarkerLayer = () => {
  alarmMarkerLayer = new VectorLayer('alarm-marker')
  alarmMarkerLayer.addTo(map)
}
