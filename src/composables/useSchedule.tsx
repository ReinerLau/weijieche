import { createTimingTask, deleteTimingTask, getTemplateList, getTimingTaskList } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
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
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { cloneDeep } from 'lodash'
import { computed, defineComponent, onMounted, ref, toRaw, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

const defaultFormData = {
  loopConditions: '',
  conditions: [],
  time: '',
  code: '',
  missionId: null,
  changeMission: false
}

export const useSchedule = () => {
  const { t } = useI18n()
  const dialogVisible = ref(false)
  const ScheduleDialog = defineComponent({
    setup() {
      const formData: Ref<{
        loopConditions: string
        conditions: number[]
        time: string
        code: string
        missionId: number | null
        changeMission: boolean
      }> = ref(cloneDeep(defaultFormData))
      const loopConditionsMap = {
        DAY: '1',
        WEEK: '2',
        SINGLE: '3'
      }

      function handleLoopConditionChange(value: string) {
        if (value === loopConditionsMap.DAY) {
          formData.value.conditions = [1, 2, 3, 4, 5, 6, 7]
        } else {
          formData.value.conditions = []
        }
      }

      async function handleConfirm() {
        if (haveCurrentCar()) {
          const data: any = { ...toRaw(formData.value) }
          data.conditions = formData.value.conditions.join(',')
          data.code = currentCar.value
          const res: any = await createTimingTask(data)
          ElMessage({
            type: 'success',
            message: res.message
          })
          dialogVisible.value = false
          formData.value = cloneDeep(defaultFormData)
        }
      }

      const conditionsDisabled = computed(() => {
        return ['1', '3', undefined, ''].includes(formData.value.loopConditions)
      })

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

      const templateList = ref([])

      onMounted(async () => {
        const res = await getTemplateList({ limit: 999999, rtype: 'patroling' })
        templateList.value = res.data || []
      })

      return () => (
        <ElDialog v-model={dialogVisible.value} title={t('ding-shi-ren-wu')} width="80%">
          {{
            default: () => (
              <ElForm label-width={250} model={formData.value}>
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
            ),
            footer: () => (
              <ElButton size="large" type="primary" class="w-full" onClick={handleConfirm}>
                {t('que-ding')}
              </ElButton>
            )
          }}
        </ElDialog>
      )
    }
  })

  const searchDialogVisible = ref(false)

  const ScheduleSearchDialog = defineComponent({
    setup() {
      const list: Ref<any[]> = ref([])
      async function handleDelete(id: number) {
        await deleteTimingTask(id)
        getList()
      }
      watch(searchDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      async function getList() {
        const res = await getTimingTaskList()
        list.value = res.data?.list || []
      }

      const columns = [
        {
          label: t('ji-qi-ren-bian-ma'),
          prop: 'code'
        },
        {
          label: t('lu-jing-mo-ban'),
          prop: 'missionId'
        },
        {
          label: t('xun-huan-tiao-jian'),
          prop: 'loopConditions'
        },
        {
          label: t('xun-huan-shi-jian'),
          prop: 'conditions'
        },
        {
          label: t('chong-dian-ren-wu'),
          prop: 'changeMission'
        },
        {
          label: t('fan-hui-jie-guo'),
          prop: 'result'
        },
        {
          label: t('xia-fa-shi-jian'),
          prop: 'time'
        }
      ]

      return () => (
        <ElDialog v-model={searchDialogVisible.value} title={t('ding-shi-ren-wu')} width="80%">
          {{
            default: () => (
              <ElTable height="50vh" data={list.value} highlight-current-row>
                {columns.map((item) => (
                  <ElTableColumn property={item.prop} label={item.label} />
                ))}
                <ElTableColumn label={t('cao-zuo')}>
                  {{
                    default: ({ row }: { row: any }) => (
                      <ElButton link onClick={() => handleDelete(row.id)}>
                        {t('shan-chu')}
                      </ElButton>
                    )
                  }}
                </ElTableColumn>
              </ElTable>
            )
          }}
        </ElDialog>
      )
    }
  })

  return {
    ScheduleDialog,
    dialogVisible,
    ScheduleSearchDialog,
    searchDialogVisible
  }
}
