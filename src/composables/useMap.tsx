import { getCarInfo } from '@/api'
import { currentCar } from '@/shared'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import * as maptalks from 'maptalks'
import { onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
export const useMap = () => {
  const { t } = useI18n()
  const mapRef: Ref<HTMLElement | undefined> = ref()
  let map: maptalks.Map
  let markerLayer: maptalks.VectorLayer
  let toolbar: maptalks.control.Toolbar
  let drawTool: maptalks.DrawTool
  let lineLayer: maptalks.VectorLayer

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

  function initToolbar() {
    toolbar = new maptalks.control.Toolbar({
      vertical: true,
      // position: 'top-right',
      items: [
        {
          item: 'test',
          children: [
            {
              item: 'new',
              click() {
                lineLayer.clear()
                drawTool.enable()
              }
            }
          ]
        },
        {
          item: 'test1',
          click() {
            lineLayer.clear()
          }
        }
      ]
    })
    toolbar.addTo(map)
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
      const line: maptalks.LineString = e.geometry
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
      event: () => {
        lineLayer.clear()
      }
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
