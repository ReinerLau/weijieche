// https://vueuse.org/
import { useDark, useToggle } from '@vueuse/core'
import { ElButton, ElTooltip } from 'element-plus'
import { useI18n } from 'vue-i18n'
// 图标查看 docs/图标引入
import IconPhMoon from '~icons/ph/moon'
import IconPhSun from '~icons/ph/sun'

// 主题相关
export const useTheme = () => {
  const { t } = useI18n()

  // 当前是否处于黑暗模式
  // https://vueuse.org/core/useDark/#usedark
  const isDark = useDark()

  // 切换白天和黑暗模式
  const toggleDark = useToggle(isDark)

  // 切换主题按钮
  const ThemeController = () => (
    <ElTooltip content={t('zhu-ti')}>
      <ElButton link onClick={() => toggleDark()} class="mr-3">
        {isDark.value ? <IconPhSun /> : <IconPhMoon />}
      </ElButton>
    </ElTooltip>
  )
  return {
    ThemeController
  }
}
