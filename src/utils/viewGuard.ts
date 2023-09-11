import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router } from 'vue-router'

export function checkToken(router: Router) {
  router.beforeEach((to) => {
    NProgress.start()
    document.title = '围界车'
    // const hasToken = getToken()
    // if (hasToken) {
    //   return handleHasToken(to)
    // } else {
    //   return handleNoToken(to)
    // }
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
