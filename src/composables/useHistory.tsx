import { useRouter } from 'vue-router'
import { ElButton, ElTooltip } from 'element-plus'
import MdiHistory from '~icons/mdi/history'
import { useI18n } from 'vue-i18n'

// 首页分析相关
export const useHistory = () => {
  const router = useRouter()

  const { t } = useI18n()

  function jumpHistory() {
    router.push('/')
  }

  // 切换按钮
  const HistoryController = () => (
    <ElTooltip content={t('shou-ye-fen-xi')}>
      <ElButton link onClick={() => jumpHistory()} class="mx-3">
        <MdiHistory />
      </ElButton>
    </ElTooltip>
  )
  return {
    HistoryController
  }
}
