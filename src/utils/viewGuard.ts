import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { getToken } from './token'

const whiteList = ['/login']

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

async function handleHasToken(to: RouteLocationNormalizedLoaded) {
  if (to.path === '/login') {
    return '/'
  } else {
    return true
  }
}

function handleNoToken(to: RouteLocationNormalizedLoaded) {
  if (!whiteList.includes(to.path)) {
    return '/login'
  }
  return true
}
