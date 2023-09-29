import Cookies from 'js-cookie'

export function setCookie(key: string, value: string, expires?: number) {
  return Cookies.set(key, value, { expires })
}

export function getCookie(key: string) {
  return Cookies.get(key)
}

export function removeCookie(key: string) {
  return Cookies.remove(key)
}
