import {
  createHomePath,
  createMissionTemplate,
  deleteHomePath,
  getHomePath,
  goHome,
  sendMavlinkMission
} from '@/api'
import { useTemplate } from '@/composables'
import { currentCar } from '@/shared'
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElInput,
  ElMessage,
  ElOption,
  ElScrollbar,
  ElSelect,
  ElSwitch
} from 'element-plus'
import * as maptalks from 'maptalks'
import { Fragment, defineComponent, onMounted, ref, watch, reactive, withModifiers } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSchedule } from './useSchedule'
import IconMdiSignalOff from '~icons/mdi/signal-off'
import { useMapMaker } from '@/composables'
import { getCarInfo } from '@/api'
import { usePointTask } from './usePointTask'
import CameraPlayer from '@/components/CameraPlayer.vue'
import { cameraList } from '@/shared'

//异常警报图层
export let alarmMarkerLayer: maptalks.VectorLayer

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
    setup(props, { emit }) {
      // 国际化相关
      const { t } = useI18n()

      // const { isMobile } = useResponsive()

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
        searchDialogVisible: scheduleSearchDialogVisible,
        ScheduleSearchDialog,
        PatrolTaskDialog,
        patrolTaskVisible: patrolTaskDialogVisible,
        FileUploadDialog,
        fileUploadVisible: fileUploadDialogVisible
      } = useSchedule()

      const { handleTaskEvent, deleteTaskEvent, PointSettingFormDialog, getList } = usePointTask()

      // 车辆标记相关
      const { isConnectedWS, initMakerLayer, recordPathPoints } = useMapMaker()

      // 地图 DOM 元素
      const mapRef: Ref<HTMLElement | undefined> = ref()

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

      //录制路线图层实例
      // let recordPathLayer: maptalks.VectorLayer

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
      let tileLayer: maptalks.TileLayer

      // 判断车辆
      function haveCurrentCar() {
        if (currentCar.value) {
          return true
        } else {
          ElMessage({ type: 'error', message: t('qing-xuan-ze-che-liang') })
          return false
        }
      }

      // 每次点击地图新建路线点的事件
      function pathPointDrawendEvent(e: any) {
        const pathPoint = e.geometry as maptalks.Marker

        pathPoint.config({
          draggable: true
        })
        pathPoint.setSymbol({
          textName: pathPoints.length + 1,
          markerType: 'ellipse',
          markerFill: '#ff930e',
          markerWidth: 13,
          markerHeight: 13
        })
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
          console.log(pointCoordinates)
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

      // 初始化地图
      function initMap() {
        tileLayer = new maptalks.TileLayer('base', {
          urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
          tileSystem: [1, 1, -20037508.34, -20037508.34]
        })
        if (mapRef.value) {
          map = new maptalks.Map(mapRef.value, {
            center: [113.48570073, 22.56210475],
            zoom: 12,
            maxZoom: 19,
            minZoom: 11,
            baseLayer: tileLayer
          })

          initMakerLayer(map)

          alarmMarkerLayer = new maptalks.VectorLayer('alarm-marker')
          alarmMarkerLayer.addTo(map)

          homePathLayer = new maptalks.VectorLayer('home-point')
          homePathLayer.addTo(map)

          pathLayer = new maptalks.VectorLayer('line')
          pathLayer.addTo(map)

          taskPointLayer = new maptalks.VectorLayer('task-point')
          taskPointLayer.addTo(map)

          patrolpathLayer = new maptalks.VectorLayer('patrol')
          patrolpathLayer.addTo(map)
        }
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
                }
              }
            },
            {
              title: t('jie-shu-lu-zhi'),
              event: () => {
                if (havePath()) {
                  clearLine()
                  clearDrawTool()
                  isRecord.value = false
                  ElMessage({
                    type: 'success',
                    message: t('yi-jie-shu-lu-zhi-qing-bao-cun-lu-xian')
                  })
                  isRecordPath.value = true
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
          title: t('xia-fa-ren-wu'),
          event: handleCreatePlan
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
          title: t('ding-shi-ren-wu'),
          subItems: [
            {
              title: t('xin-jian-ren-wu'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  scheduleDialogVisible.value = true
                }
              }
            },
            {
              title: t('ren-wu-lie-biao'),
              event: () => {
                if (endRecording()) {
                  clearDrawTool()
                  scheduleSearchDialogVisible.value = true
                }
              }
            }
          ]
        },
        {
          title: t('xun-luo-ren-wu'),
          subItems: [
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

      // 下发任务
      async function handleCreatePlan() {
        if (haveCurrentCar() && havePath()) {
          const data = getLineCoordinates(pathPoints)
          const res: any = await sendMavlinkMission(data, currentCar.value)
          ElMessage.success({
            message: res.message
          })
          clearLine()
          clearDrawTool()
        }
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
            : JSON.stringify(getLineCoordinates(pathPoints)),
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
      function handleConfirmTemplate(template: any) {
        entryPoint = undefined
        onePoint = undefined
        pathPointList.length = 0
        clearDrawTool()
        clearLine()
        templateSearchDialogVisible.value = false
        const coordinates: number[][] = JSON.parse(template.mission).map((item: any) => [
          item.y,
          item.x
        ])
        coordinates.forEach((coordinate, index) => {
          // https://maptalks.org/examples/cn/geometry/marker/#geometry_marker
          // https://maptalks.org/maptalks.js/api/1.x/Marker.html
          // https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
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
                  item: '添加返航点',
                  click: handleCreateHomePath
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
        drawTool.setMode('LineString')
        // https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
        drawTool.setSymbol({
          lineColor: '#f3072f'
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
        homePathLayer.addGeometry(e.geometry)
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
              click: clearDrawTool
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
        homePathLayer.clear()

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

      // 是否开启调试模式
      const debugMode = ref(false)
      // 开启调试模式监听鼠标移动事件，关闭调试模式移除鼠标移动事件
      watch(debugMode, (val: boolean) => {
        tileLayer.config('debug', val)
        if (val) {
          map.on('mousemove', debugMapMouseMoveEvent)
        } else {
          map.off('mousemove', debugMapMouseMoveEvent)
        }
      })

      // 当前鼠标坐标
      const mouseCoordinate = reactive({
        x: 0,
        y: 0
      })

      // 调试模式下的鼠标移动事件
      function debugMapMouseMoveEvent(e: any) {
        mouseCoordinate.x = e.coordinate.x
        mouseCoordinate.y = e.coordinate.y
      }

      // 监听到当前车辆切换之后地图中心跳转到车辆位置
      watch(currentCar, async (code: string) => {
        const res = await getCarInfo(code)
        const x = res.data.longitude
        const y = res.data.latitude
        jumpToCoordinate(x, y)
      })

      onMounted(() => {
        initMap()
        initDrawTool()
        initMenu()
        initHomePath()
        initTaskPoints()
      })

      // 视频流地址切换
      const cameraUrl = ref('')
      function handleCameraUrl(url: string) {
        emit('confirm', url)
      }
      return () => (
        <div class="h-full relative">
          <div class="absolute top-5 right-5 z-10 w-3/4 bg-[#0c2d46] border border-[#1c91c7] rounded p-2">
            <ElScrollbar>
              <div class="flex">
                {toolbarItems.map((item, index) => (
                  <Fragment>
                    {item.subItems ? (
                      <ElDropdown key={item.title} class="flex-1">
                        {{
                          default: () => (
                            <ElButton link class="w-full" type="primary">
                              {item.title}
                            </ElButton>
                          ),
                          dropdown: () => (
                            <ElDropdownMenu>
                              {item.subItems.map((subItem) => (
                                <ElDropdownItem key={subItem.title} onClick={subItem.event}>
                                  {subItem.title}
                                </ElDropdownItem>
                              ))}
                            </ElDropdownMenu>
                          )
                        }}
                      </ElDropdown>
                    ) : (
                      <ElButton class="flex-1" link type="primary" onClick={item.event}>
                        {item.title}
                      </ElButton>
                    )}
                    {index !== toolbarItems.length - 1 && (
                      <span class="px-2 text-[#1c91c7]">|</span>
                    )}
                  </Fragment>
                ))}
              </div>
            </ElScrollbar>
          </div>

          <div class="absolute bottom-5 right-5 z-10 text-right">
            <ElSwitch
              v-model={debugMode.value}
              activeText={t('tiao-shi')}
              inactiveText={t('zheng-chang')}
            />

            {debugMode.value ? (
              <div class="flex">
                <ElInput
                  v-model={mouseCoordinate.x}
                  class="mr-1"
                  onKeydown={withModifiers(
                    () => jumpToCoordinate(mouseCoordinate.x, mouseCoordinate.y),
                    ['enter']
                  )}
                />
                <ElInput
                  v-model={mouseCoordinate.y}
                  class="mr-1"
                  onKeydown={withModifiers(
                    () => jumpToCoordinate(mouseCoordinate.x, mouseCoordinate.y),
                    ['enter']
                  )}
                />
                <ElButton
                  type="primary"
                  onClick={() => jumpToCoordinate(mouseCoordinate.x, mouseCoordinate.y)}
                >
                  确定
                </ElButton>
              </div>
            ) : null}
          </div>
          {!isConnectedWS.value ? (
            <div class="absolute left-5 top-5 z-10 text-red-600">
              <IconMdiSignalOff />
            </div>
          ) : null}
          <div class="h-full" ref={mapRef}></div>
          <div
            v-show={!props.isMobile && cameraList.value.length > 0}
            class="absolute top-5 left-1 z-10 w-1/5  bg-[#0c2d46] "
          >
            <div class="bg-black flex flex-col h-[40vh]">
              <ElSelect
                v-model={cameraUrl.value}
                class="m-2"
                placeholder={t('shi-pin-qie-huan')}
                size="large"
                onChange={handleCameraUrl}
              >
                {cameraList.value.map((item: any) => (
                  <ElOption key={item.id} label={item.name} value={item.rtsp}></ElOption>
                ))}
              </ElSelect>
              <div class="h-full">
                <CameraPlayer url={cameraUrl.value} />
              </div>
            </div>
          </div>

          <TemplateDialog onConfirm={handleConfirm} />
          <TemplateSearchDialog onConfirm={handleConfirmTemplate} />
          <ScheduleDialog />
          <ScheduleSearchDialog />
          <PointSettingFormDialog />
          <PatrolTaskDialog onConfirm={handleConfirmPatrolTaskPath} />
          <FileUploadDialog onConfirm={handleConfirmFilePath} />
        </div>
      )
    }
  })
  return {
    MapContainer
  }
}
