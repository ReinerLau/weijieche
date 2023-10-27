import { request } from '@/utils'

export function getDeviceListByCode(code: string, type: string) {
  return request({
    url: `/robot-device/v1/getbyrid/${code}&${type}`,
    method: 'get'
  })
}

export function deleteDevice(id: string | number) {
  return request({
    url: `/robot-device/v1/${id}`,
    method: 'delete'
  })
}

export function updateDevice(data: any) {
  return request({
    url: '/robot-device/v1/',
    method: 'put',
    data
  })
}

export function createDevice(data: any) {
  return request({
    url: '/robot-device/v1/',
    method: 'post',
    data
  })
}

export function getDeviceTypeList() {
  return request({
    url: '/robot-device-type/v1/getList',
    method: 'get'
  })
}
