import type { Marker } from 'maptalks'
import { clearPathLayer, pathPoints, pathPointsData } from './path'
import { recordPathPoints } from './record'
import { ElMessage } from 'element-plus'
import { i18n } from '@/utils'
import { currentCar, haveCurrentCar } from '..'
import { missionTemplateId } from './template'
import { sendMavlinkMission } from '@/api'
import { clearDrawTool, drawTool } from './drawTool'
import { setEntryPoint } from './home'

// 获取路线上各个点的坐标信息
export const getLineCoordinates = (list: Marker[]) => {
  return list.map((item) => ({
    x: item.getCoordinates().y,
    y: item.getCoordinates().x,
    speed: '0'
  }))
}
// 校验地图是否已存在路线
export const havePath = () => {
  if (pathPoints.length > 1 || recordPathPoints.length > 1) {
    return true
  } else {
    ElMessage({
      type: 'error',
      message: i18n.global.t('xian-xin-jian-lu-jing')
    })
    return false
  }
}
// 下发任务
export const handleCreatePlan = async () => {
  if (haveCurrentCar() && havePath()) {
    try {
      let res: any
      if (pathPointsData.value.length !== 0) {
        const params = missionTemplateId.value
          ? {
              missionTemplateId: missionTemplateId.value
            }
          : {}
        res = await sendMavlinkMission(pathPointsData.value, currentCar.value, params)
        ElMessage.success({
          message: res.message
        })
      }
      clearPathLayer()
      clearDrawTool()
      pathPointsData.value.length = 0
    } catch (error) {
      ElMessage.error({
        message: i18n.global.t('xia-fa-ren-wu-shi-bai')
      })
    }
  }
  missionTemplateId.value = null
}
// 开始新建路线/任务点
export const handleCreatePath = (color: string, event: any) => {
  setEntryPoint(null)
  drawTool.setMode('Point')
  drawTool.setSymbol({
    markerType: 'ellipse',
    markerFill: color
  })
  drawTool.enable()
  drawTool.on('drawend', event)
}
