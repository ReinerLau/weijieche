import {
  dayjs,
  type DateModelType,
  type DateOrDates,
  ElSelect,
  ElOption,
  ElDatePicker
} from 'element-plus'
import { ref, type FunctionalComponent, type Ref } from 'vue'

import { useI18n } from 'vue-i18n'

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
  // 国际化
  const { t } = useI18n()
  const queryTimeItmes: QueryTimeItems = {
    year: { label: t('an-nian-cha-xun'), value: 'year', format: 'YYYY 年' },
    month: { label: t('an-yue-cha-xun'), value: 'month', format: 'YYYY 年 MM 月' },
    week: { label: t('an-zhou-cha-xun'), value: 'week', format: 'YYYY 年 第 w 周' },
    date: { label: t('an-tian-cha-xun'), value: 'date', format: 'YYYY 年 MM 月 DD 日' },
    daterange: {
      label: t('an-fan-wei-cha-xun'),
      value: 'daterange',
      format: 'YYYY 年 MM 月 DD 日',
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
      <div class="flex items-center flex-1 gap-x-5">
        <ElSelect
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
            class="flex-1"
            modelValue={props.modelValue}
            type={props.type}
            format={queryTimeItmes[props.type].format}
            shortcuts={queryTimeItmes[props.type].shortcuts}
            placeholder={t('qing-xuan-ze-shi-jian')}
            start-placeholder={t('qing-xuan-ze-kai-shi-shi-jian')}
            end-placeholder={t('qing-xuan-ze-jie-shu-shi-jian')}
            onUpdate:modelValue={handleChange}
          />
        )}
      </div>
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
