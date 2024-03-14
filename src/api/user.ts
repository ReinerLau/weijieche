import { request } from '@/utils'

export function login(data: { username: string; password: string }) {
  return request({
    url: '/admin/v1/login',
    method: 'post',
    data
  })
}

//指定围界车进行连接
export function openCarWs(id: string) {
  return request({
    url: `/robot-cruise/patrolingCruise/connect/${id}`,
    method: 'get'
  })
}

//指定围界车进行断开连接
export function offCarWs(id: string) {
  return request({
    url: `/robot-cruise/patrolingCruise/disconnect/${id}`,
    method: 'get'
  })
}

//获取当前围界车的连接信息
export function getCarConnectionMessage() {
  return request({
    url: '/robot-cruise/patrolingCruise/getCurrent',
    method: 'get'
  })
}
