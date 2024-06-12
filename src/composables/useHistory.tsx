import { Icon } from '@iconify/vue'
import { ElButton, ElTooltip } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// 首页分析相关
export const useHistory = () => {
  const router = useRouter()

  const { t } = useI18n()

  function jumpHistory() {
    router.push('/home')
  }

  // 切换按钮
  const HistoryController = () => (
    <ElTooltip content={t('shou-ye-fen-xi')}>
      <ElButton link onClick={() => jumpHistory()} class="mx-3">
        <Icon icon="mdi:history"></Icon>
      </ElButton>
    </ElTooltip>
  )
  return {
    HistoryController
  }
}
