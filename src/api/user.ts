import { request } from '@/utils'

export function login(data: { username: string; password: string }) {
  return request({
    url: '/admin/v1/login',
    method: 'post',
    data
  })
}
