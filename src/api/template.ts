import { request } from '@/utils'

export function getTemplateList(data: any) {
  return request({
    url: '/robot-mission-template/v1/getList',
    method: 'post',
    data
  })
}

export function deleteTemplate(id: number) {
  return request({
    url: `/robot-mission-template/v1/${id}`,
    method: 'delete'
  })
}
