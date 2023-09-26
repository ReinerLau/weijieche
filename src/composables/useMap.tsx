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
  let lineLayer: maptalks.VectorLayer
  let line: maptalks.LineString | undefined
  let homePointLayer: maptalks.VectorLayer

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
      lineLayer = new maptalks.VectorLayer('line')
      lineLayer.addTo(map)
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
      // const coordinates = [res.data.longitude, res.data.latitude]
      const coordinates = [25.97905635, -10.66232601]
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
      event: clearLine
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
              templateDialogVisible.value = true
            }
          }
        },
        {
          title: t('sou-suo'),
          event: () => {
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
            scheduleDialogVisible.value = true
          }
        },
        {
          title: t('sou-suo'),
          event: () => {
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
    }
  }

  function clearLine() {
    lineLayer.clear()
    line = undefined
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
  }

  function handleConfirmTemplate(template: any) {
    templateSearchDialogVisible.value = false
    lineLayer.clear()
    const coordinates = JSON.parse(template.mission).map((item: any) => [item.y, item.x])
    line = new maptalks.LineString(coordinates, {
      arrowStyle: 'classic',
      symbol: {
        lineColor: '#ff931e'
      }
    })
    lineLayer.addGeometry(line)
    line.startEdit()
  }

  function getLineCoordinates() {
    return line
      ? line.getCoordinates().map((item) => ({
          x: (item as maptalks.Coordinate).y,
          y: (item as maptalks.Coordinate).x
        }))
      : []
  }

  function haveLine() {
    if (line && line.getCoordinates().length > 0) {
      return true
    } else {
      ElMessage({
        type: 'error',
        message: '先新建路径'
      })
      return false
    }
  }

  function createLineEvent(e: any) {
    line = e.geometry
    if (line) {
      line.config({
        arrowStyle: 'classic'
      })
      lineLayer.addGeometry(line)
      line.startEdit()
    }
    drawTool.disable()
    drawTool.off('drawend', createLineEvent)
  }

  function createHomePointEvent(e: any) {
    homePointLayer.addGeometry(e.geometry)
    drawTool.disable()
    drawTool.off('drawend', createHomePointEvent)
  }

  function handleCreateLine() {
    clearLine()
    drawTool.setMode('LineString')
    drawTool.setSymbol({
      lineColor: '#ff931e'
    })
    drawTool.enable()
    drawTool.on('drawend', createLineEvent)
  }

  function handleCreateHomePoint() {
    drawTool.setMode('Point')
    drawTool.enable()
    drawTool.on('drawend', createHomePointEvent)
  }

  onMounted(() => {
    initMap()
    initDrawTool()
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