import { ConnectorLine, Marker, VectorLayer } from 'maptalks'
import { jumpToCoordinate, map } from './base'
import { entryPoint, setEntryPoint } from './home'
import { clearDrawTool } from './drawTool'
import { clearPathLayer, pathPointsData } from './path'
import { i18n } from '@/utils'
import { ref } from 'vue'
import { endRecording } from './record'
import { pathDataPoints } from '.'
import type { Coordinate } from '@/types'

/**
 * 巡逻路线图层实例
 */
export let patrolpathLayer: VectorLayer

/**
 * 初始化巡逻路线图层
 */
export const initPatrolpathLayer = () => {
  patrolpathLayer = new VectorLayer('patrol')
  patrolpathLayer.addTo(map)
}

/**
 * 清空巡逻路线
 */
export const clearDrawPatrolLine = () => {
  patrolpathLayer.clear()
  patrolpathPoints.length = 0
}

/**
 * 巡逻路线点实例集合
 */
export const patrolpathPoints: Marker[] = []
/**
 * 添加巡逻路线到图层中
 * @param pathPoint 点实例
 */
export const addPatrolPathPointToLayer = (pathPoint: Marker) => {
  patrolpathLayer.addGeometry(pathPoint)
  if (entryPoint) {
    pathPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
  patrolpathPoints.push(pathPoint)
  if (patrolpathPoints.length >= 2) {
    const lastTwoPoints = patrolpathPoints.slice(-2)
    const connectLine = new ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
      showOn: 'always',
      symbol: {
        lineColor: '#DC00FE'
      },
      zIndex: -1
    })
    patrolpathLayer.addGeometry(connectLine)
  }
}

export const pathPointArray: Coordinate[] = []

/**
 * 选择巡逻任务路线按钮后显示路线在地图上
 * @param row 单条巡逻路线数据
 */
export const handleConfirmPatrolTaskPath = (row: { name: string; route: Coordinate[] }) => {
  pathPointArray.length = 0
  const text = i18n.global.t('ren-wu-ming-cheng') + ':' + row.name
  const options = {
    autoPan: true,
    dx: -3,
    dy: -12,
    content: `<div style="color:red">${text}</div>`
  }
  clearDrawTool()
  clearPathLayer()
  clearDrawPatrolLine()
  const coordinates: number[][] = row.route.map((item) => [item.y, item.x])

  coordinates.forEach((coordinate, index) => {
    const pathPoint = new Marker(coordinate, {
      symbol: {
        textName: index + 1,
        markerType: 'ellipse',
        markerFill: '#DC00FE',
        markerWidth: 13,
        markerHeight: 13
      }
    })
      .on('click', (e: { target: Marker }) => {
        setEntryPoint(e.target)
      })
      .setInfoWindow(options)
    addPatrolPathPointToLayer(pathPoint)

    const pointCoordinates = {
      x: pathPoint.getCoordinates().y,
      y: pathPoint.getCoordinates().x
    }
    pathPointArray.push(pointCoordinates)
  })
  jumpToCoordinate(pathPointArray[0].y, pathPointArray[0].x)
  patrolTaskDialogVisible.value = false
}

export const patrolTaskDialogVisible = ref(false)

export const assignTaskToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    pathDataPoints.value = JSON.stringify(pathPointsData.value)
    scheduleDialogVisible.value = true
  }
}

export const scheduleDialogVisible = ref(false)

export const taskListToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    patrolTaskDialogVisible.value = true
  }
}

export const clearPathToolbarEvent = () => {
  if (endRecording()) {
    clearDrawPatrolLine()
  }
}
// 搜索定时任务弹窗是否可见
export const searchDialogVisible = ref(false)
