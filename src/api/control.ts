import { request } from '@/utils'

export function patrolingCruise(data: any) {
  return request({
    url: '/robot-remote-control/v1/upperControl',
    method: 'post',
    data: data
  })
}

export function patrolingVoice(params: any) {
  return request({
    url: '/robot-remote-control/v1/voiceControl',
    method: 'get',
    params
  })
}

//远程操控
export function patrolingRemote(code: string, data: any) {
  return request({
    url: `/robot-cruise/PatrolingControl/${code}`,
    method: 'post',
    data: data
  })
}

//切换模式
export function patrolingSetMode(code: string, data: any) {
  return request({
    url: `/robot-cruise/PatrolingSetMode/${code}`,
    method: 'post',
    data: data
  })
}
