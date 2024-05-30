import type { Coordinate, PointData } from '@/types'
import { i18n } from '@/utils'
import { ConnectorLine, Coordinate as Coordinates, Marker, VectorLayer } from 'maptalks'
import { ref } from 'vue'
import { clearMenu, map } from './base'
import { clearDrawTool } from './drawTool'
import { entryPoint, setEntryPoint } from './home'
import { endRecording } from './record'

export const roadnetPathDialogVisible = ref(false)

export const roadnetPathToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    roadnetPathDialogVisible.value = true
  }
}
//所有点的集合
export const roadnetPathPointsData = ref<Coordinate[]>([])

//所有路线集合
export const roadnetPathData: any = ref([])
export const roadnetPathSaveEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    roadnetPathPointsData.value.length = 0
    roadnetPathData.value.forEach((item: any) => {
      item.forEach((i: any) => {
        roadnetPathPointsData.value.push(i)
      })
    })
    // pointList上传路网的点数据
    roadnetPathPointsData.value = roadnetPathPointsData.value.map((item) => {
      return { x: item.x, y: item.y }
    })
  }
}
export let roadnetPathLayer: VectorLayer

export const roadnetPathPoints: Marker[] = []

/**
 * 初始化路线图层
 */
export const initRoadnetPathLayer = () => {
  roadnetPathLayer = new VectorLayer('roadnet-line')
  roadnetPathLayer.addTo(map)
}

/**
 * 清空路线图层
 */
export const clearRoadnetPathLayer = () => {
  roadnetPathLayer.clear()
  roadnetPathPoints.length = 0
  roadnetPathData.value.length = 0
}

export const getRoadnetPoints = (coordinates: PointData[]) => {
  const pointMarkers = coordinates.map((coordinate, index) => {
    const pointMarker = new Marker([coordinate.y, coordinate.x], {
      symbol: {
        markerType: 'ellipse',
        markerFill: '#FF0070',
        markerWidth: 15,
        markerHeight: 15
      },
      draggable: true
    }).on('click', (e: { target: Marker }) => {
      setEntryPoint(e.target)
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

// 展示单条路线
export const initRoadnetPath = (coordinates: PointData[]) => {
  //单条路线的marker数组
  const roadnetPathPoints = getRoadnetPoints(coordinates)

  roadnetPathPoints.forEach((pathPoint: Marker) => {
    // 单条路线的点线绘制到图层
    addRoadnetPathToLayer(pathPoint)
  })
}

/**
 * 添加路线点到图层中
 * @param pathPoint 路线点实例
 */
export const addRoadnetPathToLayer = (pathPoint: Marker) => {
  // 添加点
  roadnetPathLayer.addGeometry(pathPoint)

  if (entryPoint) {
    pathPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }

  roadnetPathPoints.push(pathPoint)
  if (roadnetPathPoints.length >= 2) {
    const lastTwoPoints = roadnetPathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: 'pink'
      },
      zIndex: -1
    })
    roadnetPathLayer.addGeometry(connectLine)
  }
}

export const showPath = (coordinates: PointData[]) => {
  initRoadnetPath(coordinates)

  roadnetPathData.value.push(coordinates)

  const coordinate = new Coordinates([coordinates[1].y, coordinates[1].x])
  map.setCenter(coordinate).setZoom(16)
  roadnetPathPoints.length = 0
}

export const setDrawEndMenu = () => {
  map.setMenuItems([
    {
      item: i18n.global.t('qing-kong'),
      click: () => {
        clearRoadnetPathLayer()
        clearMenu()
      }
    }
  ])
}
