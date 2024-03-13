import { Marker } from 'maptalks'
import { clearOnePoint, handleCreateHomePath, setEntryPoint, setOnePoint } from './home'
import {
  addPathPointToLayer,
  clearPathLayer,
  pathLayer,
  pathPointList,
  pathPointsData
} from './path'
import { clearDrawTool } from './drawTool'
import { handleTaskEvent, initTaskPoints } from './taskPoint'
import {
  carSpeedData,
  currentSelectedPointIndex,
  handlePointConfigEvent,
  pointConfigDrawerVisible
} from './pointConfig'
import { jumpToCoordinate } from './base'
import { i18n } from '@/utils'
import { ref } from 'vue'

export const fileUploadDialogVisible = ref(false)

//上传文件后路线显示地图上
export const handleConfirmFilePath = (data: any) => {
  setEntryPoint(null)
  clearOnePoint()
  pathLayer.clear()
  pathPointList.length = 0
  clearDrawTool()
  clearPathLayer()
  fileUploadDialogVisible.value = false
  const coordinates: number[][] = data.map((item: any) => [item.y, item.x])
  coordinates.forEach((coordinate, index) => {
    const pathPoint = new Marker(coordinate, {
      symbol: {
        textName: index + 1,
        markerType: 'ellipse',
        markerFill: '#ff930e',
        markerWidth: 13,
        markerHeight: 13
      }
    })
      .setMenu({
        items: [
          {
            item: i18n.global.t('she-zhi-wei-ren-wu-dian'),
            click: () => {
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
          },
          {
            item: i18n.global.t('she-zhi-wei-fan-hang-dian'),
            click: handleCreateHomePath
          },
          {
            item: i18n.global.t('bian-ji-che-su'),
            click: () => {
              const pointCoordinates: {
                x: number
                y: number
              } = {
                x: pathPoint.getCoordinates().y,
                y: pathPoint.getCoordinates().x
              }
              currentSelectedPointIndex.value = index

              //保存已有车速值
              let carNum: string = carSpeedData.value[index] || ''
              if (!carSpeedData.value[index]) {
                const templateData: any = data[index]
                if (templateData.speed) {
                  carNum = templateData.speed.toString()
                }
              }
              pointConfigDrawerVisible.value = true
              handlePointConfigEvent(pointCoordinates, carNum)
            }
          }
        ]
      })
      .on('click', (e: { target: Marker }) => {
        setEntryPoint(null)
        setOnePoint(e.target)
      })
    addPathPointToLayer(pathPoint)
    const pointCoordinates = {
      x: pathPoint.getCoordinates().y,
      y: pathPoint.getCoordinates().x
    }
    pathPointList.push(pointCoordinates)
    pathPointsData.value = data
  })

  jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
}
