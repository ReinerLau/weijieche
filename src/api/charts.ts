import { request } from '@/utils'
export function getPatrolData(startTime: any, endTime: any) {
  return request({
    url: '/vehicle-task/v1/result/analyze',
    method: 'post',
    params: {
      startTime,
      endTime
    }
  })
}
