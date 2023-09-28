import {
  createHomePath,
  createMissionTemplate,
  deleteHomePath,
  getCarInfo,
  getHomePath,
  goHome,
  sendMavlinkMission
} from '@/api'
import { useTemplate } from '@/composables'
import { currentCar, haveCurrentCar } from '@/shared'
import {
  ElButton,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElMessage,
  ElScrollbar,
  ElSwitch
} from 'element-plus'
import * as maptalks from 'maptalks'
import { Fragment, defineComponent, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSchedule } from './useSchedule'
export const useMap = () => {
  const MapContainer = defineComponent({
    setup() {
      const { t } = useI18n()
      const {
        TemplateDialog,
        dialogVisible: templateDialogVisible,
        searchDialogVisible: templateSearchDialogVisible,
        TemplateSearchDialog
      } = useTemplate()
      const {
        dialogVisible: scheduleDialogVisible,
        ScheduleDialog,
        searchDialogVisible: scheduleSearchDialogVisible,
        ScheduleSearchDialog
      } = useSchedule()
      const mapRef: Ref<HTMLElement | undefined> = ref()
      let map: maptalks.Map
      let markerLayer: maptalks.VectorLayer
      let drawTool: maptalks.DrawTool
      let pathLayer: maptalks.VectorLayer
      let homePathLayer: maptalks.VectorLayer
      const pathPoints: maptalks.Marker[] = []
      let creatingHomePath: maptalks.LineString | undefined
      let tileLayer: maptalks.TileLayer

      function patchPointDrawendEvent(e: any) {
        const pathPoint = e.geometry as maptalks.Marker
        pathPoint.config({
          draggable: true
        })
        pathPoint.setSymbol({
          textName: pathPoints.length + 1,
          markerType: 'ellipse',
          markerFill: '#ff930e',
          markerWidth: 20,
          markerHeight: 20
        })
        addPathPointToLayer(pathPoint)
      }

      const drawToolEvents = {
        PATH_POINT_DRAW_END: {
          type: 'drawend',
          event: patchPointDrawendEvent
        },
        HOME_PATH_DRAW_END: {
          type: 'drawend',
          event: homePathDrawEndEvent
        }
      }

      function initMap() {
        tileLayer = new maptalks.TileLayer('base', {
          urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
          tileSystem: [1, 1, -20037508.34, -20037508.34]
        })
        if (mapRef.value) {
          map = new maptalks.Map(mapRef.value, {
            center: [25.97905635, -10.66232601],
            zoom: 12,
            maxZoom: 19,
            minZoom: 11,
            baseLayer: tileLayer
          })
          markerLayer = new maptalks.VectorLayer('marker')
          markerLayer.addTo(map)
          homePathLayer = new maptalks.VectorLayer('home-point')
          homePathLayer.addTo(map)
          pathLayer = new maptalks.VectorLayer('line')
          pathLayer.addTo(map)
        }
      }

      watch(currentCar, (val: string) => {
        addMarker(val)
      })

      async function addMarker(val: string) {
        markerLayer.clear()
        const res: any = await getCarInfo(val)
        if (res.data.longitude && res.data.latitude) {
          const coordinates = [res.data.longitude, res.data.latitude]
          // const coordinates = [25.97905635, -10.66232601]
          const point = new maptalks.Marker(coordinates, {
            symbol: {
              markerType: 'triangle',
              markerFill: 'red',
              markerWidth: 15,
              markerHeight: 20,
              markerRotation: -res.data.heading
            }
          })
          markerLayer.addGeometry(point)
        }
      }

      function initDrawTool() {
        drawTool = new maptalks.DrawTool({ mode: 'Point' })
        drawTool.addTo(map).disable()
      }

      const toolbarItems = reactive([
        {
          title: '新建路径',
          event: () => {
            clearLine()
            clearDrawTool()
            handleCreatePath()
          }
        },
        {
          title: '清空路径',
          event: () => {
            clearLine()
            clearDrawTool()
          }
        },
        {
          title: '下发',
          event: handleCreatePlan
        },
        {
          title: '返航',
          subItems: [
            {
              title: '新建',
              event: () => {
                clearDrawTool()
                clearLine()
                handleCreateHomePath()
              }
            },
            {
              title: t('bao-cun'),
              event: () => {
                if (haveHomePath()) {
                  clearDrawTool()
                  handleSaveHomePath()
                }
              }
            },
            {
              title: '开始',
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
          title: t('mo-ban'),
          subItems: [
            {
              title: t('bao-cun'),
              event: () => {
                if (havePath()) {
                  clearDrawTool()
                  templateDialogVisible.value = true
                }
              }
            },
            {
              title: t('sou-suo'),
              event: () => {
                clearDrawTool()
                templateSearchDialogVisible.value = true
              }
            }
          ]
        },
        {
          title: t('ding-shi-ren-wu'),
          subItems: [
            {
              title: t('xin-jian'),
              event: () => {
                clearDrawTool()
                scheduleDialogVisible.value = true
              }
            },
            {
              title: t('sou-suo'),
              event: () => {
                clearDrawTool()
                scheduleSearchDialogVisible.value = true
              }
            }
          ]
        }
      ])

      async function handleCreatePlan() {
        if (haveCurrentCar() && havePath()) {
          const data = getLineCoordinates()
          const res: any = await sendMavlinkMission(data, currentCar.value)
          ElMessage.success({
            message: res.message
          })
          clearLine()
          clearDrawTool()
        }
      }

      function clearLine() {
        pathLayer.clear()
        pathPoints.length = 0
        creatingHomePath = undefined
      }

      async function handleConfirm(formData: { name?: string; memo?: string }) {
        const data = {
          mission: JSON.stringify(getLineCoordinates()),
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
      }

      function handleConfirmTemplate(template: any) {
        templateSearchDialogVisible.value = false
        const coordinates: number[][] = JSON.parse(template.mission).map((item: any) => [
          item.y,
          item.x
        ])

        coordinates.forEach((coodrinate, index) => {
          const pathPoint = new maptalks.Marker(coodrinate, {
            symbol: {
              textName: index + 1,
              markerType: 'ellipse',
              markerFill: '#ff930e',
              markerWidth: 20,
              markerHeight: 20
            }
          })
          addPathPointToLayer(pathPoint)
        })
      }

      function addPathPointToLayer(pathPoint: maptalks.Marker) {
        pathLayer.addGeometry(pathPoint)
        if (entryPoint) {
          pathPoint.setCoordinates(entryPoint.getCenter())
          entryPoint = undefined
        }
        pathPoints.push(pathPoint)
        if (pathPoints.length >= 2) {
          const lastTwoPoints = pathPoints.slice(-2)
          const connectLine = new maptalks.ConnectorLine(lastTwoPoints[0], lastTwoPoints[1], {
            showOn: 'always',
            symbol: {
              lineColor: '#ff930e'
            },
            zIndex: -1
          })
          pathLayer.addGeometry(connectLine)
        }
      }

      function getLineCoordinates() {
        return pathPoints.map((item) => ({
          x: item.getCoordinates().y,
          y: item.getCoordinates().x
        }))
      }

      function havePath() {
        if (pathPoints.length > 0) {
          return true
        } else {
          ElMessage({
            type: 'error',
            message: '先新建路径'
          })
          return false
        }
      }

      function haveHomePath() {
        if (creatingHomePath && creatingHomePath.getCoordinates().length > 0) {
          return true
        } else {
          ElMessage({
            type: 'error',
            message: '先新建返航路径'
          })
          return false
        }
      }

      function homePathDrawEndEvent(e: any) {
        e.geometry.config({
          arrowStyle: 'classic'
        })
        pathLayer.addGeometry(e.geometry)
        e.geometry.startEdit()
        drawTool.disable()
        drawTool.off('drawend', drawToolEvents.HOME_PATH_DRAW_END.event)
        creatingHomePath = e.geometry
      }

      function handleCreatePath() {
        drawTool.setMode('Point')
        drawTool.setSymbol({
          markerType: 'ellipse',
          markerFill: '#ff931e'
        })
        drawTool.enable()
        drawTool.on('drawend', drawToolEvents.PATH_POINT_DRAW_END.event)
      }

      function handleCreateHomePath() {
        drawTool.setMode('LineString')
        drawTool.setSymbol({
          lineColor: '#ff931e'
        })
        drawTool.enable()
        drawTool.on('drawend', homePathDrawEndEvent)
      }

      function initMenu() {
        map.setMenu({
          items: [
            {
              item: '结束',
              click: clearDrawTool
            }
          ]
        })
      }

      function clearDrawTool() {
        drawTool.disable()
        for (const key in drawToolEvents) {
          const event = drawToolEvents[key as keyof typeof drawToolEvents].event
          const type = drawToolEvents[key as keyof typeof drawToolEvents].type
          drawTool.off(type, event)
        }
      }

      let entryPoint: maptalks.Marker | undefined

      async function handleSaveHomePath() {
        if (creatingHomePath) {
          const coordinates = creatingHomePath.getCoordinates() as maptalks.Coordinate[]
          const entryPoint = coordinates[0]
          const homePoint = coordinates.slice(-1)[0]
          const data = {
            enterGps: JSON.stringify({ x: entryPoint.y, y: entryPoint.x }),
            gps: JSON.stringify({ x: homePoint.y, y: homePoint.x }),
            mission: JSON.stringify(coordinates.slice(1).map((item) => ({ x: item.y, y: item.x }))),
            name: new Date().toString(),
            carStop: 1
          }
          const res: any = await createHomePath(data)
          ElMessage({
            type: 'success',
            message: res.message
          })
          clearLine()
          initHomePath()
        }
      }

      let previewHomePath: maptalks.LineString | undefined

      async function initHomePath() {
        homePathLayer.clear()
        const res = await getHomePath({ limit: 99999 })
        const homePaths = res.data.list || []
        homePaths.forEach((item: any) => {
          const menuOptions = {
            items: [
              {
                item: '删除',
                click: async () => {
                  await deleteHomePath(item.id)
                  initHomePath()
                }
              }
            ]
          }
          const entryPointCoord = JSON.parse(item.enterGps)
          new maptalks.Marker([entryPointCoord.y, entryPointCoord.x], {
            symbol: {
              markerType: 'ellipse',
              markerWidth: 40,
              markerHeight: 40,
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

      const debugMode = ref(false)
      watch(debugMode, (val: boolean) => {
        tileLayer.config('debug', val)
      })

      onMounted(() => {
        initMap()
        initDrawTool()
        initMenu()
        initHomePath()
      })
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
          <div class="absolute bottom-5 right-5 z-10">
            <ElSwitch v-model={debugMode.value} activeText="调试" inactiveText="正常" />
          </div>
          <div class="h-full" ref={mapRef} />
          <TemplateDialog onConfirm={handleConfirm} />
          <TemplateSearchDialog onConfirm={handleConfirmTemplate} />
          <ScheduleDialog />
          <ScheduleSearchDialog />
        </div>
      )
    }
  })
  return {
    MapContainer
  }
}
