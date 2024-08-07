import type { Coordinate, PointData } from '@/types'
import { i18n } from '@/utils'
import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { getLineCoordinates, handleCreatePath } from '.'
import { clearMenu, jumpToCoordinate, map } from './base'
import { clearDrawTool } from './drawTool'
import { entryPoint, handleCreateHomePath, setEntryPoint } from './home'
import { configCarSpeed } from './pointConfig'
import { endRecording, isRecord, isRecordPath } from './record'
import { handleTaskEvent, initTaskPoints } from './taskPoint'

/**
 * 通用路线图层
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export let pathLayer: VectorLayer

/**
 * 路线图层上所有点实例的集合
 * @example 绘制路线
 * @example 录制路线
 * @example 路线模板
 */
export const pathPoints: Marker[] = []

/**
 * 路线图层上所有点数据
 */
export const pathPointsData = ref<PointData[]>([])

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
  pathPointsData.value.length = 0
}

/**
 * 添加路线点到路线图层中
 * @param pathPoint 路线点实例
 */
export const addPathPointToLayer = (pathPoint: Marker) => {
  pathLayer.addGeometry(pathPoint)
  if (entryPoint) {
    pathPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
  pathPoints.push(pathPoint)
  if (pathPoints.length >= 2) {
    const lastTwoPoints = pathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: '#ff930e'
      },
      zIndex: -1
    })
    pathLayer.addGeometry(connectLine)
  }
}

/**
 * 绘制时每次点击点击触发的事件
 * @param e
 */
export const pathPointDrawendEvent = (e: { geometry: Marker }) => {
  const pathPoint = e.geometry

  pathPoint.config({
    draggable: true
  })
  pathPoint
    .setSymbol({
      textName: pathPoints.length + 1,
      markerType: 'ellipse',
      markerFill: '#ff930e',
      markerWidth: 15,
      markerHeight: 15,
      textSize: 9
    })
    .on('click', (e: { target: Marker }) => {
      setEntryPoint(e.target)
    })
  addPathPointToLayer(pathPoint)
}

export const drawPathToolbarEvent = () => {
  if (endRecording()) {
    clearPathLayer()
    clearDrawTool()
    handleCreatePath('#ff931e', pathPointDrawendEvent)
    isRecord.value = false
    isRecordPath.value = false
    setDrawPathMenu()
  }
}

export const endDrawPath = () => {
  clearDrawTool()
  pathPointsData.value = getLineCoordinates(pathPoints)
  if (pathPoints.length > 0) {
    setDrawEndMenu()
  } else {
    clearMenu()
  }
  setPointMenu()
}

export const pathMenu = [
  {
    item: i18n.global.t('jie-shu'),
    click: endDrawPath
  }
]

const setDrawPathMenu = () => {
  clearMenu()
  map.setMenuItems(pathMenu)
}

const addTaskPoint = (pathPoint: any) => {
  const pointCoordinates = {
    x: pathPoint.getCoordinates().y,
    y: pathPoint.getCoordinates().x
  }
  handleTaskEvent(JSON.stringify(pointCoordinates), () => {
    pathLayer.addGeometry(pathPoint)
    clearDrawTool()
    initTaskPoints()
  })
}

export const getPointMenuItems = (pathPoint: Marker, index: number) => {
  return [
    {
      item: i18n.global.t('xin-zeng-ren-wu-dian'),
      click: () => {
        addTaskPoint(pathPoint)
      }
    },
    {
      item: i18n.global.t('tian-jia-fan-hang-dian'),
      click: () => {
        handleCreateHomePath(pathPoint)
      }
    },
    {
      item: i18n.global.t('bian-ji-che-su'),
      click: () => {
        configCarSpeed(pathPoint, index)
      }
    }
  ]
}
export const setPointMenu = () => {
  pathPoints.forEach((pathPoint, index) => {
    const pointMenuItems = getPointMenuItems(pathPoint, index)
    pathPoint.setMenuItems(pointMenuItems)
  })
}

export const clearPath = () => {
  clearPathLayer()
  clearMenu()
}
export const clearPathMenu = [
  {
    item: i18n.global.t('qing-kong'),
    click: clearPath
  }
]
export const setDrawEndMenu = () => {
  map.setMenuItems(clearPathMenu)
}

export const clearToolbarEvent = () => {
  clearPathLayer()
  clearDrawTool()
  isRecord.value = false
}
export const getMarkerFill = (index: number, coordinates: Coordinate[]) => {
  if (index === 0) {
    return '#FF0070'
  } else if (index === coordinates.length - 1) {
    return '#FF0070'
  } else {
    return '#8D70DD'
  }
}

export const getPoints = (coordinates: PointData[]) => {
  const pointMarkers = coordinates.map((coordinate, index) => {
    const pointMarker = new Marker([coordinate.y, coordinate.x], {
      symbol: {
        textName: coordinate.speed,
        markerType: index === 0 ? 'diamond' : 'ellipse',
        markerFill: getMarkerFill(index, coordinates),
        markerWidth: 15,
        markerHeight: 15,
        textSize: 9
      },
      draggable: true
    })
    pointMarker.on('dragend', function (e) {
      const newCoordinate = [e.target.getCoordinates().x, e.target.getCoordinates().y]
      coordinates[index] = {
        x: newCoordinate[1],
        y: newCoordinate[0],
        speed: coordinates[index].speed
      }
    })
    return pointMarker
  })
  return pointMarkers
}

export const templatePathPoints = ref<Marker[] | undefined>()
export const initPath = (coordinates: PointData[]) => {
  templatePathPoints.value = getPoints(coordinates)
  templatePathPoints.value.forEach((pathPoint) => {
    addPathPointToLayer(pathPoint)
  })
  setPointMenu()
}
export const initPathData = (coordinates: PointData[]) => {
  pathPointsData.value = coordinates
}

export const showPath = (coordinates: PointData[]) => {
  initPath(coordinates)
  initPathData(coordinates)
  jumpToCoordinate(coordinates[0].y, coordinates[0].x)
  clearMenu()
  setDrawEndMenu()
}
