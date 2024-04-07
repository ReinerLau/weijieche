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

export function fetchNotProcessAlarm() {
  return request<{ createTime: string; picPath: string; code: string; id: number }>({
    url: '/opencv-record/v1/getNotProcess',
    method: 'get'
  })
}

export enum Mode {
  NOT_PROCESS = 0,
  PROCESS = 1,
  ACTIVE = 3
}

export enum Type {
  PERSON = 1,
  HOLE = 2,
  SALUTE = 3
}

export function postAlarmHandling(data: {
  code?: string
  mode?: Mode
  type?: Type
  opencvRecordId?: number
}) {
  return request({
    url: '/opencv-record/v1/alarmHandling',
    method: 'post',
    data
  })
}
