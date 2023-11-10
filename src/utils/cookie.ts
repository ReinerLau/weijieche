import Cookies from 'js-cookie'

// 设置 cookie
export function setCookie(key: string, value: string, expires?: number) {
  return Cookies.set(key, value, { expires })
}

// 获取 cookie
export function getCookie(key: string) {
  return Cookies.get(key)
}

// 删除 cookie
export function removeCookie(key: string) {
  return Cookies.remove(key)
}
