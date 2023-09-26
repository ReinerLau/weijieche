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
import { computed, defineComponent, onMounted, ref, toRaw, watch, type Ref } from 'vue'

export const useSchedule = () => {
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
      }> = ref({
        loopConditions: '',
        conditions: [],
        time: '',
        code: '',
        missionId: null,
        changeMission: false
      })
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
        }
      }

      const conditionsDisabled = computed(() => {
        return ['1', '3', undefined, ''].includes(formData.value.loopConditions)
      })

      const dayOptions = [
        {
          value: 1,
          label: '周一'
        },
        {
          value: 2,
          label: '周二'
        },
        {
          value: 3,
          label: '周三'
        },
        {
          value: 4,
          label: '周四'
        },
        {
          value: 5,
          label: '周五'
        },
        {
          value: 6,
          label: '周六'
        },
        {
          value: 7,
          label: '周日'
        }
      ]

      const templateList = ref([])

      onMounted(async () => {
        const res = await getTemplateList({ limit: 999999, rtype: 'patroling' })
        templateList.value = res.data || []
      })

      return () => (
        <ElDialog v-model={dialogVisible.value} title="定时任务" width="80%">
          {{
            default: () => (
              <ElForm label-width={100} model={formData.value}>
                <ElFormItem prop="missionId" label="路径模板">
                  <ElSelect v-model={formData.value.missionId} placeholder="请选择" class="w-full">
                    {templateList.value.map((item: any) => (
                      <ElOption label={item.name} value={item.id}></ElOption>
                    ))}
                  </ElSelect>
                </ElFormItem>
                <ElFormItem prop="loopConditions" label="循环条件">
                  <ElSelect
                    v-model={formData.value.loopConditions}
                    placeholder="请选择"
                    class="w-full"
                    onChange={handleLoopConditionChange}
                  >
                    <ElOption label="每天" value={loopConditionsMap.DAY}></ElOption>
                    <ElOption label="每周" value={loopConditionsMap.WEEK}></ElOption>
                    <ElOption label="单次" value={loopConditionsMap.SINGLE}></ElOption>
                  </ElSelect>
                </ElFormItem>
                <ElFormItem prop="conditions" label="循环时间">
                  <ElCheckboxGroup
                    v-model={formData.value.conditions}
                    disabled={conditionsDisabled.value}
                  >
                    {dayOptions.map((item) => {
                      return <ElCheckbox label={item.value}>{item.label}</ElCheckbox>
                    })}
                  </ElCheckboxGroup>
                </ElFormItem>
                <ElFormItem prop="time" label="下发时间">
                  <ElDatePicker
                    v-model={formData.value.time}
                    type="datetime"
                    placeholder="请选择"
                    defaultValue={new Date()}
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DDTHH:mm"
                  />
                </ElFormItem>
                <ElFormItem prop="changeMission" label="返回充电点">
                  <ElSwitch
                    v-model={formData.value.changeMission}
                    inline-prompt
                    active-text="是"
                    inactiveText="否"
                  />
                </ElFormItem>
              </ElForm>
            ),
            footer: () => (
              <ElButton size="large" type="primary" class="w-full" onClick={handleConfirm}>
                确定
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
          label: '机器人编码',
          prop: 'code'
        },
        {
          label: '路径模板',
          prop: 'missionId'
        },
        {
          label: '循环条件',
          prop: 'loopConditions'
        },
        {
          label: '循环时间',
          prop: 'conditions'
        },
        {
          label: '充电任务',
          prop: 'changeMission'
        },
        {
          label: '返回结果',
          prop: 'result'
        },
        {
          label: '下发时间',
          prop: 'time'
        }
      ]

      return () => (
        <ElDialog v-model={searchDialogVisible.value} title="定时任务" width="80%">
          {{
            default: () => (
              <ElTable height="50vh" data={list.value} highlight-current-row>
                {columns.map((item) => (
                  <ElTableColumn property={item.prop} label={item.label} />
                ))}
                <ElTableColumn label="操作">
                  {{
                    default: ({ row }: { row: any }) => (
                      <ElButton link onClick={() => handleDelete(row.id)}>
                        删除
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
