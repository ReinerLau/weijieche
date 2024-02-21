import { checkToken } from '@/utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        title: '登录'
      }
    },
    {
      path: '/home',
      name: 'history',
      component: () => import('@/views/StatisticAnalysis'),
      meta: {
        title: ''
      }
    }
  ]
})

checkToken(router)

export default router
