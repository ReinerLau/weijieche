import { request } from '@/utils'

export * from './camera'
export * from './control'

export function getCarInfo(code: string) {
  return request({
    url: `/robot-vehicle-log/v1/getone/${code}`,
    method: 'get'
  })
}
