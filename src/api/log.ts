import { request } from '@/utils'

export function getAllLog() {
  return request({
    url: `/robot-abnormal-log/v1/getAbnormalByRType/patroling`,
    method: 'get'
  })
}

export function deleteLog(id: string) {
  return request({
    url: `/robot-abnormal-log/v1/${id}`,
    method: 'delete'
  })
}
export function getPatrolTask(params: object) {
  return request({
    url: `/vehicle-task/v1/list`,
    method: 'get',
    params
  })
}

export function getPatrolTaskById(id: number) {
  return request({
    url: `/vehicle-task/v1/${id}`,
    method: 'get'
  })
}

export function getTaskWarning(taskId: number) {
  return request({
    url: `/opencv-record/v1/getWarning/${taskId}`,
    method: 'get'
  })
}

export function downloadVideo(id: number) {
  return request({
    url: `/vehicle-task/v1/download/${id}`,
    method: 'get'
  })
}
