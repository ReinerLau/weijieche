import { request } from '@/utils'

export function getCameraList(params: any) {
  return request({
    url: '/camera/v1/',
    method: 'get',
    params: params
  })
}

export function deleteCamera(id: string | number) {
  return request({
    url: `/camera/v1/${id}`,
    method: 'delete'
  })
}

export function updateCamera(data: any) {
  return request({
    url: '/camera/v1',
    method: 'put',
    data
  })
}

export function createCamera(data: any) {
  return request({
    url: '/camera/v1',
    method: 'post',
    data
  })
}

export function bindCamera(params: any) {
  return request({
    url: '/camera/v1/updateToRid',
    method: 'post',
    params
  })
}

export function unbindCamera(params: any) {
  return request({
    url: '/camera/v1/unbindToRid',
    method: 'delete',
    params
  })
}

export function getCameraListByCode(code: string, type: string) {
  return request({
    url: `/camera/v1/getbyrid/${code}&${type}`,
    method: 'get'
  })
}
