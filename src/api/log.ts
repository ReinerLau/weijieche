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
