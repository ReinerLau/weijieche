import { request } from '@/utils'

export function getCarList(type: string) {
  return request({
    url: `/robot-archives/v1/findByRobotTypeAndCompany/${type}`,
    method: 'post'
  })
}
