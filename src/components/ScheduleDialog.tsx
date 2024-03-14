import { createTimingTask, getTemplateList } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { handleCreatePlan } from '@/shared/map'
import { scheduleDialogVisible } from '@/shared/map/patrolPath'
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElFormItem,
  ElMessage,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElScrollbar,
  ElSelect,
  ElSwitch
} from 'element-plus'
import { cloneDeep } from 'lodash'
import { computed, defineComponent, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// 重置表单数据
const defaultFormData = {
  loopConditions: '',
  conditions: [],
  time: '',
  code: '',
  missionId: null,
  changeMission: false
}

export default defineComponent({
  props: {
    pointsdata: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    // 表单数据
    const formData = ref<{
      loopConditions: string
      conditions: number[]
      time: string
      code: string
      missionId: number | null
      changeMission: boolean
    }>(cloneDeep(defaultFormData))

    // 不同循环条件对应的值映射
    const loopConditionsMap = {
      DAY: '1',
      WEEK: '2',
      SINGLE: '3'
    }

    // 修改循环条件
    function handleLoopConditionChange(value: string) {
      if (value === loopConditionsMap.DAY) {
        formData.value.conditions = [1, 2, 3, 4, 5, 6, 7]
      } else {
        formData.value.conditions = []
      }
    }

    // 保存
    async function handleConfirm() {
      if (haveCurrentCar()) {
        if (isChange.value) {
          const data: any = { ...toRaw(formData.value) }
          data.conditions = formData.value.conditions.join(',')
          data.code = currentCar.value
          const res: any = await createTimingTask(data)
          ElMessage({
            type: 'success',
            message: res.message
          })
        } else {
          handleCreatePlan()
        }
        scheduleDialogVisible.value = false
        formData.value = cloneDeep(defaultFormData)
      }
    }

    // 按天、单次情况下需要禁用周选择
    const conditionsDisabled = computed(() => {
      return ['1', '3', undefined, ''].includes(formData.value.loopConditions)
    })

    // 一周内可选项
    const dayOptions = [
      {
        value: 1,
        label: t('zhou-yi')
      },
      {
        value: 2,
        label: t('zhou-er')
      },
      {
        value: 3,
        label: t('zhou-san')
      },
      {
        value: 4,
        label: t('zhou-si')
      },
      {
        value: 5,
        label: t('zhou-wu')
      },
      {
        value: 6,
        label: t('zhou-liu')
      },
      {
        value: 7,
        label: t('zhou-ri')
      }
    ]

    // 模板列表数据
    const templateList = ref([])

    // 监听弹窗加载获取模板数据
    watch(scheduleDialogVisible, async (val) => {
      isChange.value = false
      formData.value = cloneDeep(defaultFormData)
      if (val) {
        const res = await getTemplateList({ limit: 999999, rtype: 'patroling' })
        templateList.value = res.data || []
      }
    })

    const isChange = ref(false)

    watch(isChange, async (val) => {
      if (val) {
        const res = await getTemplateList({ limit: 999999, rtype: 'patroling' })
        templateList.value = res.data || []
      }
      formData.value = cloneDeep(defaultFormData)
    })
    return () => (
      <ElDialog v-model={scheduleDialogVisible.value} width="50vw" align-center>
        {{
          header: () => (
            <div class=" flex flex-col ">
              <span class="mb-3">{t('xin-jian-ren-wu')}</span>
              <ElRadioGroup v-model={isChange.value}>
                <ElRadioButton label={false}>{t('pu-tong-ren-wu')}</ElRadioButton>
                <ElRadioButton label={true}>{t('ding-shi-ren-wu')}</ElRadioButton>
              </ElRadioGroup>
            </div>
          ),
          default: () =>
            isChange.value === true ? (
              <ElForm label-width={150} model={formData.value}>
                <ElFormItem prop="missionId" label={t('lu-jing-mo-ban')}>
                  <ElSelect
                    v-model={formData.value.missionId}
                    placeholder={t('qing-xuan-ze')}
                    class="w-full"
                  >
                    {templateList.value.map((item: any) => (
                      <ElOption label={item.name} value={item.id}></ElOption>
                    ))}
                  </ElSelect>
                </ElFormItem>
                <ElFormItem prop="loopConditions" label={t('xun-huan-tiao-jian')}>
                  <ElSelect
                    v-model={formData.value.loopConditions}
                    placeholder={t('qing-xuan-ze')}
                    class="w-full"
                    onChange={handleLoopConditionChange}
                  >
                    <ElOption label={t('mei-tian')} value={loopConditionsMap.DAY}></ElOption>
                    <ElOption label={t('mei-zhou')} value={loopConditionsMap.WEEK}></ElOption>
                    <ElOption label={t('dan-ci')} value={loopConditionsMap.SINGLE}></ElOption>
                  </ElSelect>
                </ElFormItem>
                <ElFormItem prop="conditions" label={t('xun-huan-shi-jian')}>
                  <ElCheckboxGroup
                    v-model={formData.value.conditions}
                    disabled={conditionsDisabled.value}
                  >
                    {dayOptions.map((item) => {
                      return <ElCheckbox label={item.value}>{item.label}</ElCheckbox>
                    })}
                  </ElCheckboxGroup>
                </ElFormItem>
                <ElFormItem prop="time" label={t('xia-fa-shi-jian')}>
                  <ElDatePicker
                    v-model={formData.value.time}
                    type="datetime"
                    placeholder={t('qing-xuan-ze')}
                    defaultValue={new Date()}
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DDTHH:mm"
                  />
                </ElFormItem>
                <ElFormItem prop="changeMission" label={t('fan-hui-chong-dian-dian')}>
                  <ElSwitch
                    v-model={formData.value.changeMission}
                    inline-prompt
                    active-text={t('shi')}
                    inactiveText={t('fou')}
                  />
                </ElFormItem>
              </ElForm>
            ) : (
              <div class="flex flex-col ">
                <span>{t('lu-xian-dian')}</span>
                <ElScrollbar height="25vh">
                  <span>{props.pointsdata.value}</span>
                </ElScrollbar>
              </div>
            ),
          footer: () => (
            <ElButton size="large" type="primary" class="w-full" onClick={handleConfirm}>
              {t('xia-fa-ren-wu')}
            </ElButton>
          )
        }}
      </ElDialog>
    )
  }
})
