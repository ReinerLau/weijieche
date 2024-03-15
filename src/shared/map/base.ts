import { TileLayer, Map, Coordinate } from 'maptalks'
import { haveCurrentCar } from '..'
import { getCarInfo } from '@/api'
import { currentCar } from '@/shared'

/**
 * 底图图层
 */
export let baseLayer: TileLayer

/**
 * 地图实例
 */
export let map: Map

/**
 * 设置各缩放等级分辨率
 * @returns 各缩放等级分辨率
 */
const initResolutions = () => {
  const result = []
  const d = 2 * 6378137 * Math.PI
  for (let i = 0; i < 25; i++) {
    result[i] = d / (256 * Math.pow(2, i))
  }
  return result
}

/**
 * 初始化地图
 */
export const initMap = (mapRef: HTMLDivElement) => {
  map = new Map(mapRef, {
    center: [113.48570073, 22.56210475],
    spatialReference: {
      resolutions: initResolutions()
    },
    zoom: 12,
    minZoom: 11,
    baseLayer: initBaseLayer()
  })
}

/**
 * 初始化底图图层
 * @returns 地图图层实例
 */
const initBaseLayer = () => {
  baseLayer = new TileLayer('base', {
    maxAvailableZoom: 19,
    urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
    tileSystem: [1, 1, -20037508.34, -20037508.34]
  })
  return baseLayer
}

/**
 * 坐标跳转
 * @param x 经度
 * @param y 纬度
 */
export const jumpToCoordinate = (x: number, y: number) => {
  const coordinate = new Coordinate([x, y])
  map.setCenter(coordinate).setZoom(18)
}

/**
 * 回到地图中心
 */
export const backToCenter = async () => {
  if (haveCurrentCar()) {
    const res = await getCarInfo(currentCar.value)
    const x = res.data.longitude
    const y = res.data.latitude
    jumpToCoordinate(x, y)
  }
}

export const clearMenu = () => {
  map.removeMenu()
}
