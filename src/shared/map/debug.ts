import { reactive } from 'vue'
import { map } from './base'
import { Marker, VectorLayer, type Coordinate } from 'maptalks'

/**
 * 要跳转的坐标
 */
export const mouseCoordinate = reactive({
  x: 0,
  y: 0
})

/**
 * 存放标记的图层
 */
let tempLayer: VectorLayer

/**
 * 监听地图双击事件
 */
export const onMapDBClick = () => {
  map.on('dblclick', (ev: { coordinate: Coordinate }) => {
    updateMarker(ev.coordinate.x, ev.coordinate.y)
    updateDebugCoordinate(ev.coordinate.x, ev.coordinate.y)
  })
}

/**
 * 更新标记
 * @param x 经度
 * @param y 纬度
 */
const updateMarker = (x: number, y: number) => {
  tempLayer && tempLayer.remove()
  tempLayer = new VectorLayer('temp')
  tempLayer.addTo(map)
  const marker = new Marker([x, y])
  tempLayer.addGeometry(marker)
}

/**
 * 更新调试器上的经纬度
 * @param x 经度
 * @param y 纬度
 */
const updateDebugCoordinate = (x: number, y: number) => {
  mouseCoordinate.x = x
  mouseCoordinate.y = y
}
