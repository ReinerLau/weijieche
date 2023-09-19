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

export function patrolingSetMode(code: string, data: any) {
  return request({
    url: '/robot-cruise/PatrolingControl/' + code,
    method: 'post',
    data: data
  })
}
