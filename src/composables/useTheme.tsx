import { useDark, useToggle } from '@vueuse/core'
import { ElButton } from 'element-plus'
export const useTheme = () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const ThemeController = (
    <ElButton link onClick={() => toggleDark()}>
      {isDark ? '☀️' : '🌙'}
    </ElButton>
  )
  return {
    ThemeController
  }
}
