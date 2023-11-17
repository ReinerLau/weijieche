import { request } from '@/utils'

export function deletePointTask(id: string | number) {
  return request({
    url: `/vehicle/point-task/v1/delete/${id}`,
    method: 'delete'
  })
}

export function updatePointTask(data: any) {
  return request({
    url: '/vehicle/point-task/v1/update/',
    method: 'put',
    data
  })
}

export function createPointTask(data: any) {
  return request({
    url: '/vehicle/point-task/v1/create/',
    method: 'post',
    data
  })
}

export function getPointTaskList() {
  return request({
    url: '/vehicle/point-task/v1/list/',
    method: 'get'
  })
}
