import {
  createHomePath,
  createMissionTemplate,
  deleteHomePath,
  getHomePath,
  goHome,
  sendMavlinkMission
} from '@/api'
import { useCreateMap, useTemplate } from '@/composables'
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
import { usePointConfig } from '@/composables'
import ToolbarController from '@/components/ToolbarController.vue'
import DebugController from '@/components/DebugController.vue'
import VideoController from '@/components/VideoController.vue'

//异常警报图层
export let alarmMarkerLayer: maptalks.VectorLayer

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

      const { mapRef, initMap, getBaseLayer } = useCreateMap()

      // 模板相关
      const {
        TemplateDialog,
        dialogVisible: templateDialogVisible,
        searchDialogVisible: templateSearchDialogVisible,
        TemplateSearchDialog
      } = useTemplate()

      // 路线点设置相关
      const {
        PointConfigDrawer,
        pointConfigDrawerVisible: pointPathConfigVisible,
        handlePointConfigEvent
      } = usePointConfig()

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

      // 地图实例
      // https://maptalks.org/maptalks.js/api/1.x/Map.html
      // https://maptalks.org/examples/cn/map/load/#map_load
      let map: maptalks.Map

      // 绘制工具实例
      // https://maptalks.org/maptalks.js/api/1.x/DrawTool.html
      // https://maptalks.org/examples/cn/interaction/draw-tool/#interaction_draw-tool
      let drawTool: maptalks.DrawTool

      // 路线图层实例
      // https://maptalks.org/maptalks.js/api/1.x/VectorLayer.html
      // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
      let pathLayer: maptalks.VectorLayer

      //巡逻路线图层
      let patrolpathLayer: maptalks.VectorLayer

      // 返航路线图层实例
      // https://maptalks.org/maptalks.js/api/1.x/VectorLayer.html
      // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
      let homePathLayer: maptalks.VectorLayer
      // 绘制返航路线图层实例
      let homePathDrawLayer: maptalks.VectorLayer

      //任务图层实例
      let taskPointLayer: maptalks.VectorLayer

      // 路线所有点的组合
      // https://maptalks.org/maptalks.js/api/1.x/Marker.html
      // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
      const pathPoints: maptalks.Marker[] = []

      //入口点
      let entryPoint: maptalks.Marker | undefined

      // 当前正在创建的返航路线
      // https://maptalks.org/maptalks.js/api/1.x/LineString.html
      // https://maptalks.org/examples/cn/geometry/linestring/#geometry_linestring
      let creatingHomePath: maptalks.LineString | undefined

      // 瓦片图层实例
      // https://maptalks.org/examples/cn/map/load/#map_load
      // https://maptalks.org/maptalks.js/api/1.x/TileLayer.html
      // https://github.com/maptalks/maptalks.js/wiki/Tile-System#tile-system-in-maptalks
      let baseLayer: maptalks.TileLayer

      let pointNum: number = 0
      let clickNum: number = 0
      // 保存已有车速值
      const carSpeedData = ref<string[]>([])
      // 每次点击地图新建路线点的事件
      function pathPointDrawendEvent(e: any) {
        pointNum++
        const chooseNum: number = pointNum
        carSpeedData.value.length = 0
        const pathPoint = e.geometry as maptalks.Marker
        const pointMenuOptions = {
          items: [
            {
              item: t('she-zhi-che-su'),
              click: () => {
                const pointCoordinates: {
                  x: number
                  y: number
                } = {
                  x: pathPoint.getCoordinates().y,
                  y: pathPoint.getCoordinates().x
                }
                clickNum = chooseNum
                //保存已有车速值
                const carNum: string = carSpeedData.value[clickNum - 1] || ''
                pointPathConfigVisible.value = true
                handlePointConfigEvent(pointCoordinates, carNum)
              }
            }
          ]
        }

        pathPoint.config({
          draggable: true
        })
        pathPoint
          .setSymbol({
            textName: pathPoints.length + 1,
            markerType: 'ellipse',
            markerFill: '#ff930e',
            markerWidth: 13,
            markerHeight: 13
          })
          .setMenu(pointMenuOptions)
        addPathPointToLayer(pathPoint)
      }

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

      /**
       * 初始化
       */
      function init() {
        map = initMap()
        baseLayer = getBaseLayer()

        initMakerLayer(map)

        //警报图层
        alarmMarkerLayer = new maptalks.VectorLayer('alarm-marker')
        alarmMarkerLayer.addTo(map)

        //返航图层
        homePathLayer = new maptalks.VectorLayer('home-point')
        homePathLayer.addTo(map)

        homePathDrawLayer = new maptalks.VectorLayer('home-line')
        homePathDrawLayer.addTo(map)

        //路线图层
        pathLayer = new maptalks.VectorLayer('line')
        pathLayer.addTo(map)

        //任务点图层
        taskPointLayer = new maptalks.VectorLayer('task-point')
        taskPointLayer.addTo(map)

        //巡逻任务路线图层
        patrolpathLayer = new maptalks.VectorLayer('patrol')
        patrolpathLayer.addTo(map)
      }

      // 初始化绘制工具
      function initDrawTool() {
        drawTool = new maptalks.DrawTool({ mode: 'Point' })
        drawTool.addTo(map).disable()
      }

      const isHomePath = ref(false)
      // 按钮组
      const toolbarItems = [
        {
          title: t('lu-xian-hui-zhi'),
          subItems: [
            {
              title: t('xin-jian-lu-xian'),
              event: () => {
                clearLine()
                clearDrawTool()
                handleCreatePath('#ff931e', drawToolEvents.PATH_POINT_DRAW_END.event)
                isRecord.value = false
                isRecordPath.value = false
              }
            },
            {
              title: t('lu-zhi-lu-xian'),
              event: () => {
                clearLine()
                clearDrawTool()
                if (haveCurrentCar() && !isRecord.value) {
                  recordPathPoints.length = 0
                  isRecord.value = true
                  ElMessage({
                    type: 'success',
                    message: t('kai-shi-lu-zhi')
                  })
                } else if (isRecord.value) {
                  ElMessage({
                    type: 'warning',
                    message: '已开始录制中'
                  })
                }
              }
            },
            {
              title: t('jie-shu-lu-zhi'),
              event: () => {
                if (recordPathPoints.length > 1) {
                  clearLine()
                  clearDrawTool()
                  isRecord.value = false
                  ElMessage({
                    type: 'success',
                    message: t('yi-jie-shu-lu-zhi-qing-bao-cun-lu-xian')
                  })
                  isRecordPath.value = true
                } else {
                  ElMessage({
                    type: 'error',
                    message: t('qing-xian-xin-jian-lu-zhi-lu-jing-huo-dian-ji-qing-kong-jian')
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
              clearLine()
              clearDrawTool()
              handleCreatePath('#f3072f', drawToolEvents.TASK_POINT_DRAW_END.event)
            }
          }
        },
        {
          title: t('qing-kong'),
          event: () => {
            clearLine()
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
                  clearLine()
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
                if (haveCurrentCar()) {
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
                clearDrawPatrolLine()
              }
            }
          ]
        },
        {
          title: t('yi-jian-ding-wei'),
          event: backToCenter
        }
      ]

      async function backToCenter() {
        if (haveCurrentCar() && endRecording()) {
          const res = await getCarInfo(currentCar.value)
          const x = res.data.longitude
          const y = res.data.latitude
          jumpToCoordinate(x, y)
        }
      }

      //设置速度

      const pointsData = ref<{ x: number; y: number; speed: string }[]>([])
      const pathPointsData = ref<{ x: number; y: number; speed: string }[]>([])
      function handleConfirmPointCarConfig(data: any) {
        if (pathPointsData.value.length !== 0) {
          pointsData.value = [...pathPointsData.value]
          pointsData.value[clickNum - 1].speed = data.speed
          //保存已有车速值
          carSpeedData.value[clickNum - 1] = data.speed
          pathPointsData.value = [...pointsData.value]
        } else {
          ElMessage.error({
            message: t('lu-xian-bu-cun-zai-qing-you-jian-jie-shu-hua-xian')
          })
        }
      }

      // 下发任务

      async function handleCreatePlan() {
        isExecutePlan.value = false

        if (haveCurrentCar() && havePath() && endRecording()) {
          try {
            let res: any
            if (isRecordPath.value) {
              ElMessage({
                type: 'error',
                message: t(
                  'lu-zhi-jie-shu-qing-bao-cun-lu-zhi-lu-xian-mo-ban-xuan-ze-mo-ban-zai-xia-fa-ren-wu'
                )
              })
            } else if (pathPointsData.value.length !== 0) {
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
            clearLine()
            clearDrawTool()
            carSpeedData.value.length = 0
            pathPointsData.value.length = 0
          } catch (error) {
            ElMessage.error({
              message: t('xia-fa-ren-wu-shi-bai')
            })
          }
        }
        missionTemplateId.value = null
      }

      // 跳转到指定坐标
      function jumpToCoordinate(x: number, y: number) {
        // https://maptalks.org/maptalks.js/api/1.x/Coordinate.html
        const coordinate = new maptalks.Coordinate([x, y])
        map.setCenter(coordinate).setZoom(18)
      }

      // 清空图层上的线
      function clearLine() {
        pathLayer.clear()
        pathPoints.length = 0
        creatingHomePath = undefined
      }

      //清空巡逻路线
      function clearDrawPatrolLine() {
        patrolpathLayer.clear()
        patrolpathPoints.length = 0
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
        clearLine()
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
              .on('click', (e: any) => {
                entryPoint = e.target
              })
              .setMenu(taskMenuOptions)

            addTaskPointToLayer(taskPoint)
          }
        } catch (error) {
          ElMessage({ type: 'error', message: '异常' })
        }
      }

      let onePoint: maptalks.Marker | undefined
      const pathPointList: any = []
      // 确定选择模板路线在地图上显示
      const missionTemplateId = ref<number | null | undefined>()

      function handleConfirmTemplate(template: any) {
        entryPoint = undefined
        onePoint = undefined
        pathPointList.length = 0
        clearDrawTool()
        clearLine()
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
                    clickNum = index + 1
                    //保存已有车速值
                    let carNum: string = carSpeedData.value[index] || ''
                    if (!carSpeedData.value[index]) {
                      const templateData: any = JSON.parse(template.mission)[index]
                      if (templateData.speed) {
                        carNum = templateData.speed.toString()
                      }
                    }
                    pointPathConfigVisible.value = true
                    handlePointConfigEvent(pointCoordinates, carNum)
                  }
                }
              ]
            })
            .on('click', (e: any) => {
              entryPoint = e.target
              onePoint = e.target
            })
          addPathPointToLayer(pathPoint)
          const pointCoordinates = {
            x: pathPoint.getCoordinates().y,
            y: pathPoint.getCoordinates().x
          }
          pathPointList.push(pointCoordinates)
          pathPointsData.value = JSON.parse(template.mission)

          carSpeedData.value.length = 0
        })

        jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
      }

      // 添加路线点到图层中
      function addPathPointToLayer(pathPoint: maptalks.Marker) {
        pathLayer.addGeometry(pathPoint)
        if (entryPoint) {
          pathPoint.setCoordinates(entryPoint.getCenter())
          entryPoint = undefined
        }
        pathPoints.push(pathPoint)
        if (pathPoints.length >= 2) {
          const lastTwoPoints = pathPoints.slice(-2)
          // https://maptalks.org/maptalks.js/api/1.x/ConnectorLine.html
          // https://maptalks.org/maptalks.js/api/1.x/Marker.html#getCoordinates
          const connectLine = new maptalks.ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
            showOn: 'always',
            symbol: {
              lineColor: '#ff930e'
            },
            zIndex: -1
          })
          // https://maptalks.org/maptalks.js/api/1.x/VectorLayer.html#addGeometry
          pathLayer.addGeometry(connectLine)
        }
      }

      //上传文件后路线显示地图上
      function handleConfirmFilePath(data: any) {
        entryPoint = undefined
        onePoint = undefined
        pathLayer.clear()
        pathPointList.length = 0
        clearDrawTool()
        clearLine()
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
                    clickNum = index + 1

                    //保存已有车速值
                    let carNum: string = carSpeedData.value[index] || ''
                    if (!carSpeedData.value[index]) {
                      const templateData: any = data[index]
                      if (templateData.speed) {
                        carNum = templateData.speed.toString()
                      }
                    }
                    pointPathConfigVisible.value = true
                    handlePointConfigEvent(pointCoordinates, carNum)
                  }
                }
              ]
            })
            .on('click', (e: any) => {
              entryPoint = e.target
              onePoint = e.target
            })
          addPathPointToLayer(pathPoint)
          const pointCoordinates = {
            x: pathPoint.getCoordinates().y,
            y: pathPoint.getCoordinates().x
          }
          pathPointList.push(pointCoordinates)
          pathPointsData.value = data
          carSpeedData.value.length = 0
        })

        jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
      }

      const pathPointArray: any = []
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
        clearLine()
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
            .on('click', (e: any) => {
              entryPoint = e.target
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

      const patrolpathPoints: maptalks.Marker[] = []
      // 添加巡逻路线到图层中
      function addPatrolPathPointToLayer(pathPoint: maptalks.Marker) {
        patrolpathLayer.addGeometry(pathPoint)
        if (entryPoint) {
          pathPoint.setCoordinates(entryPoint.getCenter())
          entryPoint = undefined
        }
        patrolpathPoints.push(pathPoint)
        if (patrolpathPoints.length >= 2) {
          const lastTwoPoints = patrolpathPoints.slice(-2)
          const connectLine = new maptalks.ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
            showOn: 'always',
            symbol: {
              lineColor: '#DC00FE'
            },
            zIndex: -1
          })
          patrolpathLayer.addGeometry(connectLine)
        }
      }

      // 添加任务点到图层中
      function addTaskPointToLayer(taskPoint: maptalks.Marker) {
        taskPointLayer.addGeometry(taskPoint)
        if (entryPoint) {
          taskPoint.setCoordinates(entryPoint.getCenter())
          entryPoint = undefined
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
        entryPoint = undefined
        drawTool.setMode('Point')
        drawTool.setSymbol({
          markerType: 'ellipse',
          markerFill: color
        })
        drawTool.enable()
        drawTool.on('drawend', event)
      }

      // 开始新建返航路线
      function handleCreateHomePath() {
        onePoint = undefined
        drawTool.setMode('LineString')
        // https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
        drawTool.setSymbol({
          lineColor: 'blue'
        })
        drawTool.enable()
        drawTool.on('drawend', drawToolEvents.HOME_PATH_DRAW_END.event)
      }

      // 保存返航路线之前校验地图上是否存在返航路线
      function haveHomePath() {
        // https://maptalks.org/maptalks.js/api/1.x/LineString.html#getCoordinates
        if (creatingHomePath && creatingHomePath.getCoordinates().length > 0) {
          return true
        } else {
          ElMessage({
            type: 'error',
            message: t('xian-xin-jian-fan-hang-lu-jing')
          })
          return false
        }
      }

      // 返航路线绘制结束之后
      function homePathDrawEndEvent(e: any) {
        // https://maptalks.org/maptalks.js/api/1.x/LineString.html#config
        e.geometry.config({
          arrowStyle: 'classic'
        })
        homePathDrawLayer.addGeometry(e.geometry)
        e.geometry.startEdit()
        drawTool.disable()
        drawTool.off('drawend', drawToolEvents.HOME_PATH_DRAW_END.event)
        creatingHomePath = e.geometry
      }

      // 初始化右键菜单
      function initMenu() {
        // https://maptalks.org/examples/cn/ui-control/ui-map-menu/#ui-control_ui-map-menu
        map.setMenu({
          items: [
            {
              item: t('jie-shu'),
              click: () => {
                clearDrawTool()
                pointNum = 0
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

      // 保存返航路线
      async function handleSaveHomePath(p: any) {
        homePathDrawLayer.clear()

        if (creatingHomePath) {
          if (isHomePath.value) {
            const coordinates = creatingHomePath.getCoordinates() as maptalks.Coordinate[]
            const entryPoint = coordinates[0]
            const homePoint = coordinates.slice(-1)[0]
            const data = {
              enterGps: JSON.stringify({ x: entryPoint.y, y: entryPoint.x }),
              gps: JSON.stringify({ x: homePoint.y, y: homePoint.x }),
              mission: JSON.stringify(
                coordinates.slice(1).map((item) => ({ x: item.y, y: item.x }))
              ),
              name: new Date().toString(),
              carStop: 1
            }
            const res: any = await createHomePath(data)
            ElMessage({ type: 'success', message: res.message })
            creatingHomePath = undefined
            initHomePath()
            isHomePath.value = false
          } else if (p) {
            const coordinates = creatingHomePath.getCoordinates() as maptalks.Coordinate[]
            const entryPoint = p.getCoordinates()
            const homePoint = coordinates.slice(-1)[0]
            const data = {
              enterGps: JSON.stringify({ x: entryPoint.y, y: entryPoint.x }),
              gps: JSON.stringify({ x: homePoint.y, y: homePoint.x }),
              mission: JSON.stringify(
                coordinates.slice(1).map((item) => ({ x: item.y, y: item.x }))
              ),
              name: new Date().toString(),
              carStop: 1
            }
            const res: any = await createHomePath(data)
            ElMessage({ type: 'success', message: res.message })
            creatingHomePath = undefined
            initHomePath()
          } else {
            ElMessage.error(t('qing-cong-lu-xian-dian-kai-shi-hui-zhi'))
          }
        } else {
          ElMessage.error(t('bao-cun-fan-hang-lu-xian-chu-cuo'))
        }
      }

      // 当前预览的返航路线实例
      let previewHomePath: maptalks.LineString | undefined

      // 初始化所有返航路线
      async function initHomePath() {
        homePathLayer.clear()
        const res = await getHomePath({ limit: 99999 })
        const homePaths = res.data.list || []
        homePaths.forEach((item: any) => {
          const menuOptions = {
            items: [
              {
                item: t('shan-chu'),
                click: async () => {
                  await deleteHomePath(item.id)
                  initHomePath()
                }
              }
            ]
          }
          const entryPointCoord = JSON.parse(item.enterGps)
          // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
          // https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
          // https://maptalks.org/maptalks.js/api/1.x/Marker.html
          new maptalks.Marker([entryPointCoord.y, entryPointCoord.x], {
            symbol: {
              markerType: 'ellipse',
              markerWidth: 13,
              markerHeight: 13,
              markerFillOpacity: 0.5
            }
          })
            .on('click', (e: any) => {
              entryPoint = e.target
            })
            .on('mouseenter', () => {
              const coordinates = [
                [entryPointCoord.y, entryPointCoord.x],
                ...JSON.parse(item.mission).map((i: any) => [i.y, i.x])
              ]
              const line = new maptalks.LineString(coordinates, {
                symbol: {
                  lineColor: '#ff931e',
                  lineDasharray: [5, 5, 5]
                }
              })
              previewHomePath = line
              homePathLayer.addGeometry(previewHomePath)
            })
            .on('mouseout', () => {
              previewHomePath?.remove()
              previewHomePath = undefined
            })
            .setMenu(menuOptions)
            .addTo(homePathLayer)
          const homePointCoord = JSON.parse(item.gps)
          new maptalks.Marker([homePointCoord.y, homePointCoord.x])
            .setMenu(menuOptions)
            .addTo(homePathLayer)
        })
      }

      // 清空并禁用绘制工具所有状态，包括对事件的监听
      function clearDrawTool() {
        drawTool.disable()
        for (const key in drawToolEvents) {
          const event = drawToolEvents[key as keyof typeof drawToolEvents].event
          const type = drawToolEvents[key as keyof typeof drawToolEvents].type
          drawTool.off(type, event)
        }
      }

      /**
       * 开启调试模式显示网格
       * @param val 调试模式开启状态
       */
      const onChangeDebugMode = (val: boolean) => {
        baseLayer.config('debug', val)
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
          <DebugController
            class="absolute bottom-5 right-5 z-10"
            onChange={onChangeDebugMode}
            onJump={({ x, y }) => jumpToCoordinate(x, y)}
          />
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
          <PointConfigDrawer onConfirm={handleConfirmPointCarConfig} />
        </div>
      )
    }
  })
  return {
    MapContainer
  }
}
