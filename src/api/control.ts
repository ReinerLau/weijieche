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
export function patrolingSetMode(code: string, mode: number) {
  return request({
    url: `/robot-cruise/PatrolingSetMode/${code}/${mode}`,
    method: 'post'
  })
}

//调用指定音频
export function playAudioById(audioId: number) {
  return request({
    url: `/robot-remote-control/playAudio/${audioId}`,
    method: 'get'
  })
}

//警告灯控制
export function controlAlarmLight(data: any) {
  return request({
    url: '/robot-remote-control/v1/VoiceAlarmLightControl',
    method: 'post',
    data: data
  })
}
