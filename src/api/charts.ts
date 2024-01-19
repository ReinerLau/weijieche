import { request } from '@/utils'
export function getPatrolData(startTime: any, endTime: any) {
  return request({
    url: '/result/analyze/v1/taskCount',
    method: 'post',
    params: {
      startTime,
      endTime
    }
  })
}
export function getErrorData(startTime: any, endTime: any) {
  return request({
    url: '/result/analyze/v1/errorCount',
    method: 'post',
    params: {
      startTime,
      endTime
    }
  })
}
