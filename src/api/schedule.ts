import { request } from '@/utils'

export function getTimingTaskList() {
  return request({
    url: '/vehicle-mission-timer/v1/list',
    method: 'get'
  })
}

export function deleteTimingTask(id: number) {
  return request({
    url: `/vehicle-mission-timer/v1/delete/${id}`,
    method: 'delete'
  })
}

export function createTimingTask(data: any) {
  return request({
    url: '/vehicle-mission-timer/v1/create',
    method: 'post',
    data
  })
}
