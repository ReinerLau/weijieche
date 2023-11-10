import { getCookie, removeCookie, setCookie } from '@/utils'
import { ref } from 'vue'

// 记住密码相关
export const useRememberPassword = () => {
  // 是否记住密码
  const ifRememberPassword = ref(false)

  // 首次加载从 cookie 读取之前的设置
  ifRememberPassword.value = Boolean(getCookie('remember_password'))

  // 首次加载如果之前设计了记住密码从 cookie 中读取密码
  function getRememberPassword() {
    if (ifRememberPassword.value) {
      return getCookie('password') || ''
    } else {
      return ''
    }
  }

  // 切换记住密码触发的事件
  function handleRememberPassword() {
    if (ifRememberPassword.value) {
      setCookie('remember_password', 'true', 15)
    } else {
      removeCookie('remember_password')
    }
  }

  return {
    ifRememberPassword,
    handleRememberPassword,
    getRememberPassword
  }
}
