import { request } from '@/utils'

export function createHomePath(data:any) {
  return request({
    url:'/vehicle-home/v1/create',
    method: 'post',
    data
  })
}

export function getHomePath(params:any) {
  return request({
    url:'/vehicle-home/v1/list',
    method: 'get',
    params
  })
}

export function deleteHomePath(id:number) {
  return request({
    url:`/vehicle-home/v1/delete/${id}`,
    method: 'delete',
  })
}