import { getCarInfo, sendMavlinkMission } from '@/api'
import { currentCar } from '@/shared'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElMessage } from 'element-plus'
import * as maptalks from 'maptalks'
import { onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { haveCurrentCar } from '../shared/index'
export const useMap = () => {
  const { t } = useI18n()
  const mapRef: Ref<HTMLElement | undefined> = ref()
  let map: maptalks.Map
  let markerLayer: maptalks.VectorLayer
  let drawTool: maptalks.DrawTool
  let lineLayer: maptalks.VectorLayer
  let line: maptalks.LineString

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
      const point = new maptalks.Marker(coordinates)
      markerLayer.addGeometry(point)
    }
  }

  function initDrawTool() {
    drawTool = new maptalks.DrawTool({
      mode: 'LineString',
      symbol: {
        lineColor: '#ff931e'
      }
    })
    drawTool.addTo(map).disable()
    drawTool.on('drawend', (e) => {
      line = e.geometry
      line.config({
        arrowStyle: 'classic'
      })
      lineLayer.addGeometry(line)
      line.startEdit()
      drawTool.disable()
    })
  }

  const toolbarItems = reactive([
    {
      title: '新建路径',
      event: () => {
        lineLayer.clear()
        drawTool.enable()
      }
    },
    {
      title: '清空路径',
      event: () => {
        lineLayer.clear()
      }
    },
    {
      title: '下发',
      event: handleCreatePlan
    },
    {
      title: t('mo-ban'),
      subItems: [
        {
          title: t('bao-cun'),
          event: () => {}
        },
        {
          title: t('sou-suo')
        }
      ]
    },
    {
      title: t('ding-shi-ren-wu'),
      subItems: [
        {
          title: t('xin-jian')
        },
        {
          title: t('sou-suo')
        }
      ]
    }
  ])

  async function handleCreatePlan() {
    if (haveCurrentCar()) {
      const data = line
        .getCoordinates()
        .map((item) => ({ x: (item as maptalks.Coordinate).y, y: (item as maptalks.Coordinate).x }))
      const res: any = await sendMavlinkMission(data, currentCar.value)
      ElMessage.success({
        message: res.message
      })
      lineLayer.clear()
    }
  }

  onMounted(() => {
    initMap()
    initDrawTool()
  })

  const MapContainer = () => (
    <div class="h-full relative">
      <div class="absolute top-5 right-5 z-10">
        {toolbarItems.map((item) => {
          if (item.subItems) {
            return (
              <ElDropdown key={item.title} class="mr-1">
                {{
                  default: () => <ElButton type="primary">{item.title}</ElButton>,
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
              <ElButton class="mr-1" type="primary" onClick={item.event}>
                {item.title}
              </ElButton>
            )
          }
        })}
      </div>
      <div class="h-full" ref={mapRef}></div>
    </div>
  )
  return {
    MapContainer
  }
}
