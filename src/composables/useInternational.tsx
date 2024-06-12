import { setCookie } from '@/utils'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElTooltip } from 'element-plus'
import { useI18n } from 'vue-i18n'
// 图标查看 docs/图标引入.md
import { Icon } from '@iconify/vue'

// 国际化相关
export const useInternational = () => {
  // 当前语言环境
  // https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  const { locale, t } = useI18n()

  // 切换语言后
  function handleChange() {
    setCookie('locale', locale.value)
    location.reload()
  }

  // 切换语言下拉框组件
  const InternationalController = () => (
    <ElTooltip content={t('yu-yan')}>
      <ElDropdown onCommand={handleChange}>
        {{
          default: () => <Icon icon="heroicons:language" />,
          dropdown: () => (
            <ElDropdownMenu>
              <ElDropdownItem
                onClick={() => {
                  locale.value = 'zh'
                }}
              >
                中文
              </ElDropdownItem>
              <ElDropdownItem
                onClick={() => {
                  locale.value = 'en'
                }}
              >
                English
              </ElDropdownItem>
              <ElDropdownItem
                onClick={() => {
                  locale.value = 'fr'
                }}
              >
                Français
              </ElDropdownItem>
            </ElDropdownMenu>
          )
        }}
      </ElDropdown>
    </ElTooltip>
  )
  return {
    InternationalController
  }
}
