import { request } from '@/utils'

export function patrolingCruise(data: any) {
  return request({
    url: '/robot-remote-control/v1/upperControl',
    method: 'post',
    data: data
  })
}
