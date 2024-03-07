import { TileLayer, Map } from 'maptalks'
import { ref } from 'vue'

export const useCreateMap = () => {
  const mapRef = ref<HTMLDivElement>()

  let baseLayer: TileLayer

  let map: Map

  const initMap = () => {
    baseLayer = new TileLayer('base', {
      urlTemplate: '/tiles/{z}/{x}/{y}.jpg',
      tileSystem: [1, 1, -20037508.34, -20037508.34]
    })

    if (mapRef.value) {
      map = new Map(mapRef.value, {
        center: [113.48570073, 22.56210475],
        zoom: 12,
        maxZoom: 19,
        minZoom: 11,
        baseLayer
      })
    }

    return map
  }

  const getMapInstance = () => {
    return map
  }

  const getBaseLayer = () => {
    return baseLayer
  }

  return {
    mapRef,
    getMapInstance,
    initMap,
    getBaseLayer
  }
}
