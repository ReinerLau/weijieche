import { request } from '@/utils'

export * from './camera'
export * from './control'
export * from './home'
export * from './schedule'
export * from './template'
export * from './user'
export * from './log'

export function getCarInfo(code: string) {
  return request({
    url: `/robot-vehicle-log/v1/getone/${code}`,
    method: 'get'
  })
}

export function sendMavlinkMission(data: { x: number; y: number }[], id: string) {
  return request({
    url: `/robot-cruise/patrolingCruise/v2/${id}`,
    method: 'post',
    data
  })
}

export function connectCar(code: string) {
  return request({
    url: `/robot-cruise/patrolingCruise/chose/${code}`,
    method: 'get'
  })
}
