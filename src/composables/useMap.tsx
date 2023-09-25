import * as maptalks from 'maptalks'
import { onMounted, ref, type Ref } from 'vue'
export const useMap = () => {
  const mapRef: Ref<HTMLElement | undefined> = ref()
  let map: maptalks.Map
  let layer: maptalks.VectorLayer

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
      layer = new maptalks.VectorLayer('vector')
      layer.addTo(map)
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
