import { TileLayer, Map, Coordinate } from 'maptalks'
import { haveCurrentCar } from '..'
import { getCarInfo } from '@/api'
import { currentCar } from '@/shared'
import { i18n } from '@/utils'
import { clearDrawTool } from './drawTool'
import { getLineCoordinates } from '.'
import { pathPoints, pathPointsData } from './path'
import { handleSaveHomePath, haveHomePath, homePathDrawLayer, onePoint } from './home'

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
// 初始化右键菜单
export const initMenu = () => {
  // https://maptalks.org/examples/cn/ui-control/ui-map-menu/#ui-control_ui-map-menu

  map.setMenu({
    width: 250,
    items: [
      {
        item: i18n.global.t('jie-shu'),
        click: () => {
          clearDrawTool()
          pathPointsData.value = getLineCoordinates(pathPoints)
        }
      },
      {
        item: i18n.global.t('qu-xiao-fan-hang-lu-xian-hui-zhi'),
        click: () => {
          clearDrawTool()
          homePathDrawLayer.clear()
        }
      },
      {
        item: i18n.global.t('bao-cun-fan-hang-lu-xian'),
        click: () => {
          if (haveHomePath()) {
            clearDrawTool()
            handleSaveHomePath(onePoint)
          }
        }
      }
    ]
  })
}
