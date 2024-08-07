import { createHomePath, deleteHomePath, getHomePath, goHome } from '@/api'
import { useCarStore } from '@/stores/car'
import { i18n } from '@/utils'
import { ElMessage } from 'element-plus'
import { ConnectorLine, LineString, Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { clearMenu, map } from './base'
import { clearDrawTool, drawTool } from './drawTool'
import { endRecording } from './record'

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
 * 清空当前正在创建的返航路线
 */
export const clearDrawingHomePath = () => {
  homePathPoints.length = 0
  homePathDrawLayer.remove()
  clearDrawTool()
  clearMenu()
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

export const homePaths = ref<{ id: number; enterGps: string; gps: string; mission: string }[]>([])

/**
 * 初始化所有返航路线
 */
export const setDelet = async (id: number) => {
  await deleteHomePath(id)
  ElMessage({ type: 'success', message: i18n.global.t('cao-zuo-cheng-gong') })
  initHomePath()
}
export const initHomePath = async () => {
  homePathLayer.clear()
  const res = await getHomePath({ limit: 99999 })
  homePaths.value = res.data.list || []

  homePaths.value.forEach((item: any) => {
    const menuOptions = {
      items: [
        {
          item: i18n.global.t('shan-chu'),
          click: () => {
            setDelet(item.id)
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

export const handleSaveHomePath = async () => {
  if (homePathPoints.length > 1) {
    const coordinates = homePathPoints.map((item) => item.getCoordinates())
    const entryPoint = coordinates[0]
    const homePoint = coordinates.slice(-1)[0]
    const data = {
      enterGps: JSON.stringify({ x: entryPoint.y, y: entryPoint.x }),
      gps: JSON.stringify({ x: homePoint.y, y: homePoint.x }),
      mission: JSON.stringify(coordinates.slice(1).map((item) => ({ x: item.y, y: item.x }))),
      name: new Date().toString(),
      carStop: 1
    }
    const res: any = await createHomePath(data)
    ElMessage({ type: 'success', message: res.message })

    clearDrawingHomePath()
    initHomePath()
  } else {
    ElMessage({
      type: 'error',
      message: i18n.global.t('xian-xin-jian-fan-hang-lu-jing')
    })
  }
}

/**
 * 开始新建返航路线
 */
export const handleCreateHomePath = (firstPoint?: Marker) => {
  if (homePathDrawLayer) {
    clearDrawingHomePath()
  }
  initHomePathDrawLayer()
  drawTool.setMode('Point')
  drawTool.setSymbol({
    markerType: 'ellipse',
    markerFill: 'blue'
  })
  drawTool.enable()
  drawTool.on('drawend', homePathDrawEndEvent)
  setHomePathDrawingMenu()
  if (firstPoint) {
    const coordinate = firstPoint.getCoordinates()
    const point = new Marker([coordinate.x, coordinate.y], {
      symbol: {
        markerType: 'ellipse',
        markerFill: 'blue',
        markerWidth: 13,
        markerHeight: 13
      },
      zIndex: -2
    })
    homePathDrawLayer.addGeometry(point)
    homePathPoints.push(point)
  }
}

export const homePathPoints: Marker[] = []

/**
 * 返航路线绘制结束事件
 * @param e 事件对象
 */
export const homePathDrawEndEvent = (e: { geometry: Marker }) => {
  const pathPoint = e.geometry
  pathPoint.config({
    draggable: true
  })
  pathPoint.setSymbol({
    markerType: 'ellipse',
    markerFill: 'blue',
    markerWidth: 13,
    markerHeight: 13
  })
  homePathDrawLayer.addGeometry(pathPoint)
  homePathPoints.push(pathPoint)
  if (homePathPoints.length >= 2) {
    const lastTwoPoints = homePathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: 'blue'
      },
      zIndex: -1
    })
    homePathDrawLayer.addGeometry(connectLine)
  }
}

export const createHomePathToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    handleCreateHomePath()
  }
}

export const startHomeToolbarEvent = async () => {
  const carStore = useCarStore()
  if (endRecording()) {
    const res: any = await goHome(carStore.currentCar)
    ElMessage({
      type: 'success',
      message: res.message
    })
  }
}

export const homePathDrawingMenu = [
  {
    item: i18n.global.t('jie-shu'),
    click: () => {
      clearDrawTool()
      setHomePathDrawendMenu()
    }
  }
]
export const homePathDrawingMenuEvent = () => {
  return homePathDrawingMenu
}

export const setHomePathDrawingMenu = () => {
  map.setMenuItems(homePathDrawingMenu)
}

export const homePathDrawendMenu = [
  {
    item: i18n.global.t('qing-kong'),
    click: clearDrawingHomePath
  },
  {
    item: i18n.global.t('bao-cun-fan-hang-lu-xian'),
    click: handleSaveHomePath
  }
]

export const setHomePathDrawendMenu = () => {
  map.setMenuItems(homePathDrawendMenu)
}
