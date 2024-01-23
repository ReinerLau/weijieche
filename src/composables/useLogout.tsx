import { useRouter } from 'vue-router'
import { ElButton, ElTooltip } from 'element-plus'
import ExitFill from '~icons/mingcute/exit-fill'
import { useI18n } from 'vue-i18n'
import { setCookie, setToken } from '@/utils'

// 首页分析相关
export const useLogout = () => {
  const router = useRouter()

  const { t } = useI18n()

  function handleLogout() {
    // 清除相关的登录信息和状态
    setCookie('username', '', -1) // 将 cookie 设置为过期
    setCookie('password', '', -1)
    setToken('') // 清除 token

    router.push('/login')
  }

  // 切换按钮
  const LogoutController = () => (
    <ElTooltip content={t('tui-chu-deng-lu')}>
      <ElButton link onClick={() => handleLogout()}>
        <ExitFill />
      </ElButton>
    </ElTooltip>
  )
  return {
    LogoutController
  }
}
