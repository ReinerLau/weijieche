import { useDark, useToggle } from '@vueuse/core'
import { ElButton } from 'element-plus'
import IconPhMoon from '~icons/ph/moon'
import IconPhSun from '~icons/ph/sun'
export const useTheme = () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const ThemeController = () => (
    <ElButton link onClick={() => toggleDark()}>
      {isDark.value ? <IconPhSun /> : <IconPhMoon />}
    </ElButton>
  )
  return {
    ThemeController
  }
}
