import { getCarInfo } from '@/api'
import { currentCar } from '@/shared'
import * as maptalks from 'maptalks'
import { onMounted, ref, watch, type Ref } from 'vue'
export const useMap = () => {
  const mapRef: Ref<HTMLElement | undefined> = ref()
  let map: maptalks.Map
  let markerLayer: maptalks.VectorLayer

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
      markerLayer = new maptalks.VectorLayer('vector')
      markerLayer.addTo(map)
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

  onMounted(() => {
    initMap()
  })

  const MapContainer = () => <div class="h-full" ref={mapRef}></div>
  return {
    MapContainer
  }
}
