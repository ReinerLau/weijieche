import { request } from '@/utils'

// export function getCameraList(params: any) {
//   return request({
//     url: '/camera/v1/',
//     method: 'get',
//     params: params
//   })
// }

export function getCameraList(rid: string, rtype: string) {
  return request({
    url: `/camera/v1/getCameras/${rid}&${rtype}`,
    method: 'get'
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

/**
 * 开始推流
 * @param url 推流 rtsp 地址
 * @returns 拉流 webrtc 地址
 */
export function openStream(url: string): Promise<{ message: string }> {
  return request({
    url: '/v1/monitor/rtsp/stream/open',
    method: 'post',
    data: {
      url
    }
  })
}
