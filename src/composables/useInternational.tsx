import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { useI18n } from 'vue-i18n'
import IconHeroiconsLanguage from '~icons/heroicons/language'
export const useInternational = () => {
  const { locale } = useI18n()
  const InternationalController = () => (
    <ElDropdown>
      {{
        default: () => <IconHeroiconsLanguage />,
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
  )
  return {
    InternationalController
  }
}