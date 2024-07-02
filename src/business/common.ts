import { useCarStore } from '@/stores/car'
import type { CarInfo } from '@/types'

export const hasCoordinate = (data: CarInfo) => {
  return data.longitude !== undefined && data.latitude !== undefined
}

export const isTheSameCar = (data: CarInfo) => {
  const carStore = useCarStore()
  return (
    data.rid === carStore.currentCar ||
    data.robotid === carStore.currentCar ||
    data.robotCode === carStore.currentCar
  )
}
