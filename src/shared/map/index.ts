import type { Marker } from 'maptalks'

// 获取路线上各个点的坐标信息
export const getLineCoordinates = (list: Marker[]) => {
  return list.map((item) => ({
    x: item.getCoordinates().y,
    y: item.getCoordinates().x,
    speed: '0'
  }))
}
