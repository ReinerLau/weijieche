import { request } from '@/utils'

export * from './alarm'
export * from './camera'
export * from './control'
export * from './device'
export * from './home'
export * from './log'
export * from './pointTask'
export * from './schedule'
export * from './template'
export * from './user'

export function getCarInfo(code: string) {
  return request({
    url: `/robot-vehicle-log/v1/getone/${code}`,
    method: 'get'
  })
}

export function sendMavlinkMission(data: { x: number; y: number }[], id: string, params: any) {
  return request({
    url: `/robot-cruise/patrolingCruise/v2/${id}`,
    method: 'post',
    data,
    params
  })
}

export function connectCar(code: string) {
  return request({
    url: `/robot-cruise/patrolingCruise/chose/${code}`,
    method: 'get'
  })
}

export function getCarLog() {
  return request({
    url: `/robot-vehicle-log/v1`,
    method: 'get'
  })
}

export function updateCarSpeed(data: any) {
  return request({
    url: `/robot-vehicle-log/v1/defaultSpeed`,
    method: 'put',
    data
  })
}
