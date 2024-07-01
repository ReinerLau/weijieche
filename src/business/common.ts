import { useCarStore } from '@/stores/car'
import type { CarInfo } from './carMarker'

export const hasCoordinate = (data: CarInfo) => {
  return data.longitude && data.latitude
}

export const isTheSameCar = (data: CarInfo) => {
  const carStore = useCarStore()
  return (
    data.rid === carStore.currentCar ||
    data.robotid === carStore.currentCar ||
    data.robotCode === carStore.currentCar
  )
}
