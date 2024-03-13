import { createMissionTemplate, goHome, sendMavlinkMission } from '@/api'
import { useTemplate } from '@/composables'
import { currentCar, haveCurrentCar } from '@/shared'
import { ElMessage } from 'element-plus'
import * as maptalks from 'maptalks'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSchedule } from './useSchedule'
import IconMdiSignalOff from '~icons/mdi/signal-off'
import { useMapMaker } from '@/composables'
import { getCarInfo } from '@/api'
import { usePointTask } from './usePointTask'
import ToolbarController from '@/components/ToolbarController.vue'
import DebugController from '@/components/DebugController.vue'
import VideoController from '@/components/VideoController.vue'
import PointConfigDrawer from '@/components/PointConfig/PointConfigDrawer.vue'
import { Marker } from 'maptalks'
import { backToCenter, initMap, jumpToCoordinate, map } from '@/shared/map/base'
import { initAlarmMarkerLayer } from '@/shared/map/alarm'
import {
  addPathPointToLayer,
  clearPathLayer,
  initPathLayer,
  pathLayer,
  pathPointDrawendEvent,
  pathPoints,
  pathPointsData
} from '@/shared/map/path'
import {
  carSpeedData,
  currentSelectedPointIndex,
  handlePointConfigEvent,
  pointConfigDrawerVisible
} from '@/shared/map/pointConfig'
import {
  clearOnePoint,
  entryPoint,
  handleCreateHomePath,
  handleSaveHomePath,
  haveHomePath,
  homePathDrawEndEvent,
  homePathDrawLayer,
  initHomePath,
  initHomePathDrawLayer,
  initHomePathLayer,
  isHomePath,
  onePoint,
  setEntryPoint,
  setOnePoint
} from '@/shared/map/home'
import { clearDrawTool, drawTool, initDrawTool } from '@/shared/map/drawTool'
import {
  addPatrolPathPointToLayer,
  clearDrawPatrolLine,
  initPatrolpathLayer,
  pathPointArray
} from '@/shared/map/patrolPath'

//判断任务是否下发
export const isExecutePlan = ref(false)
export const isRecord = ref(false)
export const isRecordPath = ref(false)
export const useMap = () => {
  const MapContainer = defineComponent({
    emits: ['confirm'],
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    setup(props) {
      // 国际化相关
      const { t } = useI18n()

      //保存路线点
      const pathDataPoints = ref()

      // 模板相关
      const {
        TemplateDialog,
        dialogVisible: templateDialogVisible,
        searchDialogVisible: templateSearchDialogVisible,
        TemplateSearchDialog
      } = useTemplate()

      // 定时任务相关
      const {
        dialogVisible: scheduleDialogVisible,
        ScheduleDialog,
        ScheduleSearchDialog,
        PatrolTaskDialog,
        patrolTaskVisible: patrolTaskDialogVisible,
        FileUploadDialog,
        fileUploadVisible: fileUploadDialogVisible
      } = useSchedule(handleCreatePlan)

      const { handleTaskEvent, deleteTaskEvent, PointSettingFormDialog, getList } = usePointTask()

      // 车辆标记相关
      const { isConnectedWS, initMakerLayer, recordPathPoints } = useMapMaker()

      //任务图层实例
      let taskPointLayer: maptalks.VectorLayer

      // 每次点击地图新建任务点的事件
      async function taskPointDrawEndEvent(e: any) {
        const taskPoint = e.geometry as maptalks.Marker
        taskPoint.setSymbol({
          markerType: 'ellipse',
          markerFill: '#138C46',
          markerWidth: 13,
          markerHeight: 13
        })
        const pointCoordinates = {
          x: taskPoint.getCoordinates().y,
          y: taskPoint.getCoordinates().x
        }
        handleTaskEvent(JSON.stringify(pointCoordinates), () => {
          addTaskPointToLayer(taskPoint)
          clearDrawTool()
          initTaskPoints()
        })
      }

      // 绘制工具相关的事件
      const drawToolEvents = {
        PATH_POINT_DRAW_END: {
          type: 'drawend',
          event: pathPointDrawendEvent
        },
        HOME_PATH_DRAW_END: {
          type: 'drawend',
          event: homePathDrawEndEvent
        },
        TASK_POINT_DRAW_END: {
          type: 'drawend',
          event: taskPointDrawEndEvent
        }
      }

      const mapRef = ref<HTMLDivElement>()

      /**
       * 初始化
       */
      function init() {
        initMap(mapRef.value!)
        initMakerLayer(map)
        initAlarmMarkerLayer()
        initPathLayer()
        initHomePathLayer()
        initHomePathDrawLayer()
        initPatrolpathLayer()

        //任务点图层
        taskPointLayer = new maptalks.VectorLayer('task-point')
        taskPointLayer.addTo(map)
      }

      // 按钮组
      const toolbarItems = [
        {
          title: t('lu-xian-hui-zhi'),
          subItems: [
            {
              title: t('xin-jian-lu-xian'),
              event: () => {
                if (endRecording()) {
                  clearPathLayer()
                  clearDrawTool()
                  handleCreatePath('#ff931e', drawToolEvents.PATH_POINT_DRAW_END.event)
                  isRecord.value = false
                  isRecordPath.value = false
                }
              }
            },
            {
              title: t('lu-zhi-lu-xian'),
              event: () => {
                clearPathLayer()
                clearDrawTool()
                if (haveCurrentCar() && !isRecord.value) {
                  recordPathPoints.length = 0
                  isRecord.value = true
                  ElMessage({
                    type: 'success',
                    message: t('kai-shi-lu-zhi')
                  })
                  map.removeMenu()
                  map.setMenu({
                    width: 'auto',
                    items: [
                      {
                        item: t('jie-shu-lu-zhi'),
                        click: () => {
                          if (recordPathPoints.length > 1) {
                            clearPathLayer()
                            clearDrawTool()
                            isRecord.value = false
                            ElMessage({
                              type: 'success',
                              message: t('yi-jie-shu-lu-zhi-qing-bao-cun-lu-xian')
                            })
                            isRecordPath.value = true
                            templateDialogVisible.value = true
                          } else {
                            ElMessage({
                              type: 'warning',
                              message: t('yi-jie-shu-lu-zhi-wei-cun-zai-lu-xian')
                            })
                            clearPathLayer()
                            clearDrawTool()
                            isRecord.value = false
                            isRecordPath.value = false
                            map.removeMenu()
                            initMenu()
                          }
                        }
                      }
                    ]
                  })
                } else if (isRecord.value) {
                  ElMessage({
                    type: 'warning',
                    message: t('yi-kai-shi-lu-zhi-zhong')
                  })
                }
              }
            },
            {
              title: t('shang-chuan-lu-xian'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  fileUploadDialogVisible.value = true
                }
              }
            }
          ]
        },
        {
          title: t('ren-wu-dian'),
          event: () => {
            if (endRecording()) {
              clearPathLayer()
              clearDrawTool()
              handleCreatePath('#f3072f', drawToolEvents.TASK_POINT_DRAW_END.event)
            }
          }
        },
        {
          title: t('qing-kong'),
          event: () => {
            clearPathLayer()
            clearDrawTool()
            isRecord.value = false
          }
        },
        {
          title: t('che-liang-fan-hang'),
          subItems: [
            {
              title: t('xin-jian-fan-hang-lu-xian'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  // clearPathLayer()
                  isHomePath.value = true
                  handleCreateHomePath()
                }
              }
            },
            // {
            //   title: t('bao-cun-fan-hang-lu-xian'),
            //   event: () => {
            //     if (haveHomePath()) {
            //       clearDrawTool()
            //       handleSaveHomePath(true, onePoint)
            //     }
            //   }
            // },
            {
              title: t('kai-shi-zhi-hang-fan-hang'),
              event: async () => {
                if (haveCurrentCar() && endRecording()) {
                  const res: any = await goHome(currentCar.value)
                  ElMessage({
                    type: 'success',
                    message: res.message
                  })
                }
              }
            }
          ]
        },
        {
          title: t('lu-xian-mo-ban'),
          subItems: [
            {
              title: t('bao-cun-lu-xian'),
              event: () => {
                if (havePath() && endRecording()) {
                  clearDrawTool()
                  templateDialogVisible.value = true
                }
              }
            },
            {
              title: t('mo-ban-lie-biao'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  templateSearchDialogVisible.value = true
                }
              }
            }
          ]
        },
        {
          title: t('xun-luo-ren-wu'),
          subItems: [
            {
              title: t('xia-fa-ren-wu'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  pathDataPoints.value = JSON.stringify(getLineCoordinates(pathPoints))
                  scheduleDialogVisible.value = true
                }
              }
            },
            {
              title: t('ren-wu-lie-biao'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  patrolTaskDialogVisible.value = true
                }
              }
            },
            {
              title: t('qing-kong-lu-xian'),
              event: () => {
                if (endRecording()) {
                  clearDrawPatrolLine()
                }
              }
            }
          ]
        },
        {
          title: t('yi-jian-ding-wei'),
          event: backToCenter
        }
      ]

      // 下发任务
      async function handleCreatePlan() {
        isExecutePlan.value = false
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
            isExecutePlan.value = true
            clearPathLayer()
            clearDrawTool()
            pathPointsData.value.length = 0
          } catch (error) {
            ElMessage.error({
              message: t('xia-fa-ren-wu-shi-bai')
            })
          }
        }
        missionTemplateId.value = null
      }

      // 确定保存路线模板
      async function handleConfirm(formData: { name?: string; memo?: string }) {
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

      // 在地图上显示所有任务点
      async function initTaskPoints() {
        taskPointLayer.clear()
        try {
          const taskPointList = await getList()
          for (const coordinate of taskPointList) {
            const taskMenuOptions = {
              items: [
                {
                  item: t('bian-ji'),
                  click: () => {
                    handleTaskEvent(coordinate, () => {
                      initTaskPoints()
                    })
                  }
                },
                {
                  item: t('shan-chu'),
                  click: async () => {
                    await deleteTaskEvent(coordinate.id)
                    initTaskPoints()
                  }
                }
              ]
            }
            const coordinateGps = JSON.parse(coordinate.gps)
            const taskPoint = new maptalks.Marker([coordinateGps.y, coordinateGps.x], {
              symbol: {
                // textName: index + 1,
                markerType: 'ellipse',
                markerFill: '#138C46',
                markerWidth: 13,
                markerHeight: 13
              }
            })
              .on('click', (e: { target: Marker }) => {
                setEntryPoint(e.target)
              })
              .setMenu(taskMenuOptions)

            addTaskPointToLayer(taskPoint)
          }
        } catch (error) {
          ElMessage({ type: 'error', message: '异常' })
        }
      }

      const pathPointList: any = []
      // 确定选择模板路线在地图上显示
      const missionTemplateId = ref<number | null | undefined>()

      function handleConfirmTemplate(template: any) {
        setEntryPoint(null)
        clearOnePoint()
        pathPointList.length = 0
        clearDrawTool()
        clearPathLayer()
        templateSearchDialogVisible.value = false
        missionTemplateId.value = template.id
        const coordinates: number[][] = JSON.parse(template.mission).map(
          (item: { x: number; y: number }) => [item.y, item.x]
        )
        coordinates.forEach((coordinate, index) => {
          // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
          // https://maptalks.org/maptalks.js/api/1.x/Marker.html
          // https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
          const pathPoint = new maptalks.Marker(coordinate, {
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
                  item: t('xin-zeng-ren-wu-dian'),
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
                  item: t('tian-jia-fan-hang-dian'),
                  click: handleCreateHomePath
                },
                {
                  item: t('bian-ji-che-su'),
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
        })

        jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
      }

      //上传文件后路线显示地图上
      function handleConfirmFilePath(data: any) {
        setEntryPoint(null)
        clearOnePoint()
        pathLayer.clear()
        pathPointList.length = 0
        clearDrawTool()
        clearPathLayer()
        fileUploadDialogVisible.value = false
        const coordinates: number[][] = data.map((item: any) => [item.y, item.x])
        coordinates.forEach((coordinate, index) => {
          const pathPoint = new maptalks.Marker(coordinate, {
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
                  item: t('she-zhi-wei-ren-wu-dian'),
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
                  item: t('she-zhi-wei-fan-hang-dian'),
                  click: handleCreateHomePath
                },
                {
                  item: t('bian-ji-che-su'),
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

      //选择巡逻任务路线按钮后显示路线在地图上
      function handleConfirmPatrolTaskPath(row: any) {
        pathPointArray.length = 0
        const text = t('ren-wu-ming-cheng') + ':' + row.name
        const options = {
          autoPan: true,
          dx: -3,
          dy: -12,
          content: `<div style="color:red">${text}</div>`
        }
        clearDrawTool()
        clearPathLayer()
        clearDrawPatrolLine()
        patrolTaskDialogVisible.value = false
        const coordinates: number[][] = row.route.map((item: any) => [item.y, item.x])

        coordinates.forEach((coordinate, index) => {
          const pathPoint = new maptalks.Marker(coordinate, {
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
      }

      // 添加任务点到图层中
      function addTaskPointToLayer(taskPoint: maptalks.Marker) {
        taskPointLayer.addGeometry(taskPoint)
        if (entryPoint) {
          taskPoint.setCoordinates(entryPoint.getCenter())
          setEntryPoint(null)
        }
      }

      // 获取路线上各个点的坐标信息
      function getLineCoordinates(list: any) {
        return list.map((item: any) => ({
          x: item.getCoordinates().y,
          y: item.getCoordinates().x
        }))
      }

      // 校验地图是否已存在路线
      function havePath() {
        if (pathPoints.length > 1 || recordPathPoints.length > 1) {
          return true
        } else {
          ElMessage({
            type: 'error',
            message: t('xian-xin-jian-lu-jing')
          })
          return false
        }
      }

      // 校验地图是否已结束录制路线
      function endRecording() {
        if (isRecord.value) {
          ElMessage({
            type: 'error',
            message: t('qing-xian-jie-shu-lu-zhi')
          })
          return false
        } else {
          return true
        }
      }

      // 开始新建路线/任务点
      function handleCreatePath(color: string, event: any) {
        setEntryPoint(null)
        drawTool.setMode('Point')
        drawTool.setSymbol({
          markerType: 'ellipse',
          markerFill: color
        })
        drawTool.enable()
        drawTool.on('drawend', event)
      }

      // 初始化右键菜单
      function initMenu() {
        // https://maptalks.org/examples/cn/ui-control/ui-map-menu/#ui-control_ui-map-menu

        map.setMenu({
          width: 250,
          items: [
            {
              item: t('jie-shu'),
              click: () => {
                clearDrawTool()
                pathPointsData.value = getLineCoordinates(pathPoints)
              }
            },
            {
              item: t('qu-xiao-fan-hang-lu-xian-hui-zhi'),
              click: () => {
                clearDrawTool()
                homePathDrawLayer.clear()
              }
            },
            {
              item: t('bao-cun-fan-hang-lu-xian'),
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

      // 监听到当前车辆切换之后地图中心跳转到车辆位置
      watch(currentCar, async (code: string) => {
        const res = await getCarInfo(code)
        const x = res.data.longitude
        const y = res.data.latitude
        jumpToCoordinate(x, y)
      })

      onMounted(() => {
        init()
        initDrawTool()
        initMenu()
        initHomePath()
        initTaskPoints()
      })
      return () => (
        <div class="h-full relative">
          <ToolbarController class="absolute top-5 right-5 z-10" items={toolbarItems} />
          <DebugController class="absolute bottom-5 right-5 z-10" />
          {!isConnectedWS.value && (
            <IconMdiSignalOff class="absolute left-5 top-5 z-10 text-red-600" />
          )}
          <div class="h-full" ref={mapRef}></div>
          <VideoController class="absolute top-5 left-1 z-10" isMobile={props.isMobile} />
          <TemplateDialog onConfirm={handleConfirm} />
          <TemplateSearchDialog onConfirm={handleConfirmTemplate} />
          <ScheduleDialog pointsdata={pathDataPoints} />
          <ScheduleSearchDialog />
          <PointSettingFormDialog />
          <PatrolTaskDialog onConfirm={handleConfirmPatrolTaskPath} />
          <FileUploadDialog onConfirm={handleConfirmFilePath} />
          <PointConfigDrawer />
        </div>
      )
    }
  })
  return {
    MapContainer
  }
}
