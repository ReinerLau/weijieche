import i18n from '@/utils/international'
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import IconHeroiconsLanguage from '~icons/heroicons/language'
export const useInternational = () => {
  const InternationalController = () => (
    <ElDropdown>
      {{
        default: () => <IconHeroiconsLanguage />,
        dropdown: () => (
          <ElDropdownMenu>
            <ElDropdownItem
              onClick={() => {
                i18n.global.locale.value = 'zh'
              }}
            >
              中文
            </ElDropdownItem>
            <ElDropdownItem
              onClick={() => {
                i18n.global.locale.value = 'en'
              }}
            >
              English
            </ElDropdownItem>
            <ElDropdownItem>Français</ElDropdownItem>
          </ElDropdownMenu>
        )
      }}
    </ElDropdown>
  )
  return {
    InternationalController
  }
}
