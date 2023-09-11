import { getToken } from '@/utils'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import qs from 'qs'

export const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 拦截请求
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) config.headers['Authorization'] = token

    // 只针对get方式进行序列化,序列化数组参数
    if (config.method === 'get') {
      config.paramsSerializer = function (params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 拦截响应
request.interceptors.response.use(
  (response) => {
    // code为非200是抛错
    const { code, message } = response.data
    if (code !== 200) {
      ElMessage({
        message,
        type: 'error',
        duration: 3 * 1000
      })

      return Promise.reject(message)
    } else {
      return response.data
    }
  },
  (error) => {
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)
