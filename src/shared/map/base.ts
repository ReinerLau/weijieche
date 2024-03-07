import { TileLayer, Map } from 'maptalks'
import { ref } from 'vue'

/**
 * 地图容器元素
 */
export const mapRef = ref<HTMLDivElement>()

/**
 * 底图图层
 */
let baseLayer: TileLayer

/**
 * 地图实例
 */
let map: Map

/**
 * 初始化地图
 * @returns
 */
export const initMap = () => {
  baseLayer = new TileLayer('base', {
    urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
    tileSystem: [1, 1, -20037508.34, -20037508.34]
  })

  if (mapRef.value) {
    map = new Map(mapRef.value, {
      center: [113.48570073, 22.56210475],
      zoom: 12,
      maxZoom: 19,
      minZoom: 11,
      baseLayer
    })
  }
}

/**
 * 获取地图实例
 * @returns 地图实例
 */
export const getMapInstance = () => {
  return map
}

/**
 * 获取底图实例
 * @returns 底图实例
 */
export const getBaseLayer = () => {
  return baseLayer
}
