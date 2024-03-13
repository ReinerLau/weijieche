import { LineString, Marker } from 'maptalks'
import { VectorLayer } from 'maptalks'
import { map } from './base'
import { deleteHomePath, getHomePath } from '@/api'
import { i18n } from '@/utils'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

/**
 * 当前鼠标点击的入口点
 */
export let entryPoint: Marker | null

/**
 * 存放所有已建返航路线的图层实例
 */
export let homePathLayer: VectorLayer

/**
 * 清空或设置当前高亮的入口点
 * @param val 点实例
 */
export const setEntryPoint = (val: Marker | null) => {
  entryPoint = val
}

/**
 * 初始化返航路线图层
 */
export const initHomePathLayer = () => {
  homePathLayer = new VectorLayer('home-point')
  homePathLayer.addTo(map)
}

/**
 * 绘制返航路线图层实例
 */
export let homePathDrawLayer: VectorLayer

/**
 * 初始化绘制返航路线图层
 */
export const initHomePathDrawLayer = () => {
  homePathDrawLayer = new VectorLayer('home-line')
  homePathDrawLayer.addTo(map)
}

/**
 * 当前正在创建的返航路线实例
 */
export let creatingHomePath: LineString | null

/**
 * 设置当前正在创建的返航路线实例
 * @param val 路线实例
 */
export const setCreatingHomePath = (val: LineString) => {
  creatingHomePath = val
}

/**
 * 清空当前正在创建的返航路线实例
 */
export const clearCreatingHomePath = () => {
  creatingHomePath = null
}

/**
 * 当前预览的返航路线实例
 */
export let previewHomePath: LineString | null

/**
 * 设置当前预览的返航路线实例
 * @param val 路线实例
 */
export const setPreviewHomePath = (val: LineString) => {
  previewHomePath = val
}

/**
 * 清空当前预览的返航路线实例
 */
export const clearPreviewHomePath = () => {
  previewHomePath = null
}

/**
 * 初始化所有返航路线
 */
export const initHomePath = async () => {
  homePathLayer.clear()
  const res = await getHomePath({ limit: 99999 })
  const homePaths = res.data.list || []
  homePaths.forEach((item: any) => {
    const menuOptions = {
      items: [
        {
          item: i18n.global.t('shan-chu'),
          click: async () => {
            await deleteHomePath(item.id)
            initHomePath()
          }
        }
      ]
    }
    const entryPointCoord = JSON.parse(item.enterGps)
    new Marker([entryPointCoord.y, entryPointCoord.x], {
      symbol: {
        markerType: 'ellipse',
        markerWidth: 13,
        markerHeight: 13,
        markerFillOpacity: 0.5
      }
    })
      .on('click', (e: { target: Marker }) => {
        setEntryPoint(e.target)
      })
      .on('mouseenter', () => {
        const coordinates = [
          [entryPointCoord.y, entryPointCoord.x],
          ...JSON.parse(item.mission).map((i: any) => [i.y, i.x])
        ]
        const line = new LineString(coordinates, {
          symbol: {
            lineColor: '#ff931e',
            lineDasharray: [5, 5, 5]
          }
        })
        setPreviewHomePath(line)
        homePathLayer.addGeometry(previewHomePath!)
      })
      .on('mouseout', () => {
        previewHomePath?.remove()
        clearPreviewHomePath()
      })
      .setMenu(menuOptions)
      .addTo(homePathLayer)
    const homePointCoord = JSON.parse(item.gps)
    new Marker([homePointCoord.y, homePointCoord.x]).setMenu(menuOptions).addTo(homePathLayer)
  })
}
/**
 * 保存返航路线之前校验地图上是否存在返航路线
 * @returns 是否存在返航路线
 */
export const haveHomePath = () => {
  if (creatingHomePath && creatingHomePath.getCoordinates().length > 0) {
    return true
  } else {
    ElMessage({
      type: 'error',
      message: i18n.global.t('xian-xin-jian-fan-hang-lu-jing')
    })
    return false
  }
}

/**
 * 是否为返航路线？
 */
export const isHomePath = ref(false)
