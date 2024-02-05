import {
  dayjs,
  type DateModelType,
  type DateOrDates,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElButton,
  ElTooltip,
  ElScrollbar
} from 'element-plus'
import { ref, type FunctionalComponent, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'

import ExitFill from '~icons/mingcute/exit-fill'
import HomePage from '~icons/dashicons/admin-site'

import { useRouter } from 'vue-router'
import { setCookie, setToken } from '@/utils'
import { useTheme, useInternational } from '@/composables'

interface QueryTimeItem {
  label: string
  value: 'year' | 'month' | 'week' | 'date' | 'daterange'
  format: string
  shortcuts?: { text: string; value: [Date, Date] }[]
}

interface QueryTimeItems {
  [key: string]: QueryTimeItem
}

export const useTimePicker = () => {
  const { ThemeController } = useTheme()
  const { InternationalController } = useInternational()
  // 国际化
  const { t } = useI18n()
  const queryTimeItmes: QueryTimeItems = {
    year: { label: t('an-nian-cha-xun'), value: 'year', format: 'YYYY' },
    month: { label: t('an-yue-cha-xun'), value: 'month', format: 'YYYY - MM ' },
    week: { label: t('an-zhou-cha-xun'), value: 'week', format: 'YYYY -  w ' },
    date: { label: t('an-tian-cha-xun'), value: 'date', format: 'YYYY - MM - DD ' },
    daterange: {
      label: t('an-fan-wei-cha-xun'),
      value: 'daterange',
      format: 'YYYY - MM - DD ',
      shortcuts: [
        {
          text: t('zui-jin-san-tian'),
          value: [dayjs().subtract(2, 'day').toDate(), new Date()]
        },
        {
          text: t('zui-jin-yi-zhou'),
          value: [dayjs().subtract(1, 'week').toDate(), new Date()]
        },
        {
          text: t('zui-jin-yi-ge-yue'),
          value: [dayjs().subtract(1, 'month').toDate(), new Date()]
        },
        {
          text: t('zui-jin-san-ge-yue'),
          value: [dayjs().subtract(3, 'month').toDate(), new Date()]
        },
        {
          text: t('zui-jin-yi-nian'),
          value: [dayjs().subtract(1, 'year').toDate(), new Date()]
        },
        {
          text: t('zui-jin-san-nian'),
          value: [dayjs().subtract(3, 'year').toDate(), new Date()]
        }
      ]
    }
  }

  const router = useRouter()

  function jumpHome() {
    router.push('/home')
  }

  function exitHome() {
    // 清除相关的登录信息和状态
    setCookie('username', '', -1) // 将 cookie 设置为过期
    setCookie('password', '', -1)
    setToken('') // 清除 token
    router.push('/login')
  }
  const TimePicker: FunctionalComponent<{
    type?:
      | 'year'
      | 'month'
      | 'week'
      | 'date'
      | 'daterange'
      | 'dates'
      | 'datetime'
      | 'datetimerange'
      | 'monthrange'
    modelValue?: number | string | Date
  }> = (props, { emit }) => {
    function handleChange(val: any) {
      emit('update:modelValue', val)
    }
    return (
      <ElScrollbar>
        <div class="flex items-center  justify-between ">
          <div class="flex flex-col ">
            <ElSelect
              class=" w-96 mr-10"
              modelValue={props.type}
              placeholder={t('qing-xuan-ze-shi-jian')}
              clearable
              onChange={(val: string) => {
                emit('update:modelValue', null)
                emit('update:type', val)
              }}
            >
              {Object.keys(queryTimeItmes).map((type) => (
                <ElOption
                  key={type}
                  value={queryTimeItmes[type].value}
                  label={queryTimeItmes[type].label}
                ></ElOption>
              ))}
            </ElSelect>

            {props.type && (
              <ElDatePicker
                modelValue={props.modelValue}
                type={props.type}
                format={queryTimeItmes[props.type].format}
                shortcuts={queryTimeItmes[props.type].shortcuts}
                placeholder={t('qing-xuan-ze-shi-jian')}
                start-placeholder={t('kai-shi-shi-jian')}
                end-placeholder={t('jie-shu-shi-jian')}
                onUpdate: modelValue={handleChange}
                style={{ width: '384px' }}
              />
            )}
          </div>
          <div class="flex items-center ">
            <ElTooltip content={t('cao-kong-duan')}>
              <ElButton link onClick={() => jumpHome()}>
                <HomePage />
              </ElButton>
            </ElTooltip>
            <InternationalController />
            <ThemeController />
            <ElTooltip content={t('tui-chu-deng-lu')}>
              <ElButton link onClick={() => exitHome()}>
                <ExitFill />
              </ElButton>
            </ElTooltip>
          </div>
        </div>
      </ElScrollbar>
    )
  }

  const queryTimeType: Ref<dayjs.OpUnitType> = ref('month')

  const queryTime: Ref<DateModelType | DateOrDates> = ref(dayjs().startOf('month').format())

  return {
    TimePicker,
    queryTimeType,
    queryTime
  }
}
