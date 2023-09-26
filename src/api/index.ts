import { request } from '@/utils'

export * from './camera'
export * from './control'
export * from './template'

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

export function createMissionTemplate(data: any) {
  return request({
    url: '/robot-mission-template/v1/',
    method: 'post',
    data
  })
}
