import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { getToken } from './token'
// import { login } from '@/api'
// import { setToken } from '@/utils'

const whiteList = ['/login']

// 每次跳转前检查是否存在 token
export function checkToken(router: Router) {
  router.beforeEach((to) => {
    NProgress.start()
    document.title = '围界车'
    const hasToken = getToken()
    return hasToken ? handleHasToken(to) : handleNoToken(to)
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

// 有 token 的话
async function handleHasToken(to: RouteLocationNormalizedLoaded) {
  if (to.path === '/login') {
    return '/'
  } else {
    return true
  }
}

// 没 token 的话
async function handleNoToken(to: RouteLocationNormalizedLoaded) {
  // const res = await login({
  //   username: 'admin',
  //   password: 'imrobot123'
  // })
  // setToken(res.data.tokenHead + res.data.token)
  if (!whiteList.includes(to.path)) {
    return '/login'
  }
  return true
}
