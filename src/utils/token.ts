import Cookies from 'js-cookie'

// token 前缀
const TokenKey = 'weijieche_token'

// 获取 token
export function getToken() {
  return Cookies.get(TokenKey)
}

// 保存 token
export function setToken(token: string) {
  return Cookies.set(TokenKey, token)
}

// 删除 token
export function removeToken() {
  return Cookies.remove(TokenKey)
}
