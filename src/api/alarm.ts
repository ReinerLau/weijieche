import { request } from '@/utils'

// 告警处理
export function getHandleAlarm(code: string, type: number, mode: number) {
  return request({
    url: `/opencv-record/v1/closeWarning/${code}/${type}/${mode}`,
    method: 'get'
  })
}

/**
 * 获取超时未处理警报
 * @returns
 */
export function fetchTimeoutAlarm(params: { page: number; limit: number }) {
  return request<{ list: any[] }>({
    url: '/opencv-out-time/v1/list',
    method: 'get',
    params
  })
}
