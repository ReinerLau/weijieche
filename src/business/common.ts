import type { CarInfo } from './carMarker'

export const hasCoordinate = (data: CarInfo) => {
  return data.longitude && data.latitude
}
