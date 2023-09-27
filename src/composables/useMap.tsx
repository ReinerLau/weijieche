import { createMissionTemplate, getCarInfo, sendMavlinkMission } from '@/api'
import { useTemplate } from '@/composables'
import { currentCar, haveCurrentCar } from '@/shared'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElMessage } from 'element-plus'
import * as maptalks from 'maptalks'
import { onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSchedule } from './useSchedule'
export const useMap = () => {
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
  let homePointLayer: maptalks.VectorLayer
  const pathPoints: maptalks.Marker[] = []

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
    }
  }

  function initMap() {
    const tileLayer = new maptalks.TileLayer('base', {
      urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
      debug: true,
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
      pathLayer = new maptalks.VectorLayer('line')
      pathLayer.addTo(map)
      homePointLayer = new maptalks.VectorLayer('home-point')
      homePointLayer.addTo(map)
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
      event: handleCreateLine
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
          event: handleCreateHomePoint
        },
        {
          title: '开始',
          event: () => {}
        }
      ]
    },
    {
      title: t('mo-ban'),
      subItems: [
        {
          title: t('bao-cun'),
          event: () => {
            if (haveLine()) {
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
    if (haveCurrentCar() && haveLine()) {
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
    clearLine()
    clearDrawTool()
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

  function haveLine() {
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

  function createHomePointEvent(e: any) {
    e.geometry.config({
      arrowStyle: 'classic'
    })
    homePointLayer.addGeometry(e.geometry)
    e.geometry.startEdit()
    drawTool.disable()
    drawTool.off('drawend', createHomePointEvent)
  }

  function handleCreateLine() {
    clearDrawTool()
    clearLine()
    drawTool.setMode('Point')
    drawTool.setSymbol({
      markerType: 'ellipse',
      markerFill: '#ff931e'
    })
    drawTool.enable()
    drawTool.on('drawend', drawToolEvents.PATH_POINT_DRAW_END.event)
  }

  function handleCreateHomePoint() {
    drawTool.setMode('LineString')
    drawTool.setSymbol({
      lineColor: '#1c91c7'
    })
    drawTool.enable()
    drawTool.on('drawend', createHomePointEvent)
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

  onMounted(() => {
    initMap()
    initDrawTool()
    initMenu()
  })

  const MapContainer = () => (
    <div class="h-full relative">
      <div class="absolute top-5 right-5 z-10 flex flex-col">
        {toolbarItems.map((item) => {
          if (item.subItems) {
            return (
              <ElDropdown key={item.title} class="mb-1">
                {{
                  default: () => (
                    <ElButton class="w-full" type="primary">
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
            )
          } else {
            return (
              <ElButton class="mb-1 w-full" type="primary" onClick={item.event}>
                {item.title}
              </ElButton>
            )
          }
        })}
      </div>
      <div class="h-full" ref={mapRef} />
      <TemplateDialog onConfirm={handleConfirm} />
      <TemplateSearchDialog onConfirm={handleConfirmTemplate} />
      <ScheduleDialog />
      <ScheduleSearchDialog />
    </div>
  )
  return {
    MapContainer
  }
}
