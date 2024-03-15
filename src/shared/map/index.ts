import type { Marker } from 'maptalks'
import {
  clearPathLayer,
  clearToolbarEvent,
  drawPathToolbarEvent,
  pathPoints,
  pathPointsData
} from './path'
import { recordPathPoints, recordPathToolbarEvent } from './record'
import { ElMessage } from 'element-plus'
import { i18n } from '@/utils'
import { currentCar, haveCurrentCar } from '..'
import { missionTemplateId, saveTemplateToolbarEvent, searchTemplateToolbarEvent } from './template'
import { sendMavlinkMission } from '@/api'
import { clearDrawTool, drawTool } from './drawTool'
import { createHomePathToolbarEvent, setEntryPoint, startHomeToolbarEvent } from './home'
import { ref } from 'vue'
import { backToCenter } from './base'
import { assignTaskToolbarEvent, clearPathToolbarEvent, taskListToolbarEvent } from './patrolPath'
import { taskPointToolbarEvent } from './taskPoint'
import { fileUploadToolbarEvent } from './file'

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
//保存路线点
export const pathDataPoints = ref()

// 按钮组
export const toolbarItems = [
  {
    title: i18n.global.t('lu-xian-hui-zhi'),
    subItems: [
      {
        title: i18n.global.t('xin-jian-lu-xian'),
        event: () => drawPathToolbarEvent()
      },
      {
        title: i18n.global.t('lu-zhi-lu-xian'),
        event: () => recordPathToolbarEvent()
      },
      {
        title: i18n.global.t('shang-chuan-lu-xian'),
        event: () => fileUploadToolbarEvent()
      }
    ]
  },
  {
    title: i18n.global.t('ren-wu-dian'),
    event: () => taskPointToolbarEvent()
  },
  {
    title: i18n.global.t('qing-kong'),
    event: () => clearToolbarEvent()
  },
  {
    title: i18n.global.t('che-liang-fan-hang'),
    subItems: [
      {
        title: i18n.global.t('xin-jian-fan-hang-lu-xian'),
        event: () => createHomePathToolbarEvent()
      },
      {
        title: i18n.global.t('kai-shi-zhi-hang-fan-hang'),
        event: () => startHomeToolbarEvent()
      }
    ]
  },
  {
    title: i18n.global.t('lu-xian-mo-ban'),
    subItems: [
      {
        title: i18n.global.t('bao-cun-lu-xian'),
        event: () => saveTemplateToolbarEvent()
      },
      {
        title: i18n.global.t('mo-ban-lie-biao'),
        event: () => searchTemplateToolbarEvent()
      }
    ]
  },
  {
    title: i18n.global.t('xun-luo-ren-wu'),
    subItems: [
      {
        title: i18n.global.t('xia-fa-ren-wu'),
        event: () => assignTaskToolbarEvent()
      },
      {
        title: i18n.global.t('ren-wu-lie-biao'),
        event: () => taskListToolbarEvent()
      },
      {
        title: i18n.global.t('qing-kong-lu-xian'),
        event: () => clearPathToolbarEvent()
      }
    ]
  },
  {
    title: i18n.global.t('yi-jian-ding-wei'),
    event: () => backToCenter()
  }
]

export const clearStatus = () => {
  setEntryPoint(null)
  clearDrawTool()
  clearPathLayer()
}
