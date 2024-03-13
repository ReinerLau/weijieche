import { ref } from 'vue'
import { clearOnePoint, handleCreateHomePath, setEntryPoint, setOnePoint } from './home'
import { clearDrawTool } from './drawTool'
import {
  addPathPointToLayer,
  clearPathLayer,
  pathLayer,
  pathPointList,
  pathPointsData
} from './path'
import { Marker } from 'maptalks'
import { i18n } from '@/utils'
import { handleTaskEvent, initTaskPoints } from './taskPoint'
import {
  carSpeedData,
  currentSelectedPointIndex,
  handlePointConfigEvent,
  pointConfigDrawerVisible
} from './pointConfig'
import { jumpToCoordinate } from './base'
import { isRecordPath, recordPathPoints } from './record'
import { getLineCoordinates } from '.'
import { createMissionTemplate } from '@/api'
import { ElMessage } from 'element-plus'

// 确定选择模板路线在地图上显示
export const missionTemplateId = ref<number | null | undefined>()

export const handleConfirmTemplate = (template: { id: number; mission: string }) => {
  setEntryPoint(null)
  clearOnePoint()
  pathPointList.length = 0
  clearDrawTool()
  clearPathLayer()
  missionTemplateId.value = template.id
  const coordinates: number[][] = JSON.parse(template.mission).map(
    (item: { x: number; y: number }) => [item.y, item.x]
  )
  coordinates.forEach((coordinate, index) => {
    const pathPoint = new Marker(coordinate, {
      symbol: {
        markerType: index === 0 ? 'diamond' : 'ellipse',
        markerFill: (() => {
          if (index === 0) {
            return '#FF0070'
          } else if (index === coordinates.length - 1) {
            return '#FF0070'
          } else {
            return '#8D70DD'
          }
        })(),
        markerWidth: 15,
        markerHeight: 15
      }
    })
      .setMenu({
        items: [
          {
            item: i18n.global.t('xin-zeng-ren-wu-dian'),
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
            item: i18n.global.t('tian-jia-fan-hang-dian'),
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
                const templateData: any = JSON.parse(template.mission)[index]
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
        setEntryPoint(e.target)
        setOnePoint(e.target)
      })
    addPathPointToLayer(pathPoint)
    const pointCoordinates = {
      x: pathPoint.getCoordinates().y,
      y: pathPoint.getCoordinates().x
    }
    pathPointList.push(pointCoordinates)
    pathPointsData.value = JSON.parse(template.mission)
    templateSearchDialogVisible.value = false
  })

  jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
}

export const templateDialogVisible = ref(false)
// 确定保存路线模板
export const handleConfirm = async (formData: { name?: string; memo?: string }) => {
  const data = {
    mission: isRecordPath.value
      ? JSON.stringify(getLineCoordinates(recordPathPoints))
      : JSON.stringify(pathPointsData.value),
    name: formData.name,
    memo: formData.memo,
    rtype: 'patroling'
  }
  const res: any = await createMissionTemplate(data)
  ElMessage.success({
    message: res.message
  })

  templateDialogVisible.value = false
  clearPathLayer()
  clearDrawTool()
  isRecordPath.value = false
  recordPathPoints.length = 0
}

// 搜索模板弹窗是否可见
export const templateSearchDialogVisible = ref(false)
