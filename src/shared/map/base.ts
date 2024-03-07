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
 * 最大缩放等级
 */
const MAX_ZOOM = 25

/**
 * 设置各缩放等级分辨率
 * @returns 各缩放等级分辨率
 */
const handleResolutions = () => {
  const resolutions = []
  const d = 2 * 6378137 * Math.PI
  for (let i = 0; i < MAX_ZOOM; i++) {
    resolutions[i] = d / (256 * Math.pow(2, i))
  }
  return resolutions
}

/**
 * 初始化地图
 * @returns
 */
export const initMap = () => {
  baseLayer = new TileLayer('base', {
    maxAvailableZoom: 19,
    urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
    tileSystem: [1, 1, -20037508.34, -20037508.34]
  })

  if (mapRef.value) {
    map = new Map(mapRef.value, {
      center: [113.48570073, 22.56210475],
      spatialReference: {
        resolutions: handleResolutions()
      },
      zoom: 12,
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
