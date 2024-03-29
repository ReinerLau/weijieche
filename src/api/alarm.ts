import { request } from '@/utils'

// 告警处理
export function getHandleAlarm(code: string, type: number, mode: number) {
  return request({
    url: `/opencv-record/v1/closeWarning/${code}/${type}/${mode}`,
    method: 'get'
  })
}
