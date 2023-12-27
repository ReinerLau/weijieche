import { useRouter } from 'vue-router'
import { ElButton, ElTooltip } from 'element-plus'
import MdiHistory from '~icons/mdi/history'
import { useI18n } from 'vue-i18n'

// 主题相关
export const useHistory = () => {
  const router = useRouter()

  const { t } = useI18n()

  function toggleDark() {
    router.push('/history')
  }

  // 切换主题按钮
  const HistoryController = () => (
    <ElTooltip content={t('li-shi')}>
      <ElButton link onClick={() => toggleDark()} class="ml-3">
        <MdiHistory />
      </ElButton>
    </ElTooltip>
  )
  return {
    HistoryController
  }
}
