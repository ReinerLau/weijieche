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
// 深拷贝
// https://lodash.com/docs/4.17.15#cloneDeep
import { cloneDeep } from 'lodash'
import { computed, defineComponent, onMounted, ref, toRaw, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPatrolTask } from '@/api'
import { parseTime } from '@/utils'

// 重置表单数据
const defaultFormData = {
  loopConditions: '',
  conditions: [],
  time: '',
  code: '',
  missionId: null,
  changeMission: false
}

// 定时任务相关
export const useSchedule = () => {
  // 国际化
  // https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  const { t } = useI18n()

  // 新建定时任务弹窗组件是否可见
  const dialogVisible = ref(false)

  // 新建定时任务弹窗组件
  const ScheduleDialog = defineComponent({
    setup() {
      // 表单数据
      const formData: Ref<{
        loopConditions: string
        conditions: number[]
        time: string
        code: string
        missionId: number | null
        changeMission: boolean
      }> = ref(cloneDeep(defaultFormData))

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

      // 首次加载获取模板数据
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

  // 搜索定时任务弹窗是否可见
  const searchDialogVisible = ref(false)

  // 搜索定时任务弹窗组件
  // https://cn.vuejs.org/guide/typescript/composition-api.html#without-script-setup
  const ScheduleSearchDialog = defineComponent({
    setup() {
      // 列表数据
      const list: Ref<any[]> = ref([])

      // 删除定时任务
      async function handleDelete(id: number) {
        await deleteTimingTask(id)
        getList()
      }

      // 每次打开弹窗组件获取列表
      watch(searchDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      // 获取列表数据
      async function getList() {
        const res = await getTimingTaskList()
        list.value = res.data?.list || []
      }

      // 列表表头
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

  const patrolTaskVisible = ref(false)

  //巡逻任务列表
  const PatrolTaskDialog = defineComponent({
    setup() {
      const list: Ref<any[]> = ref([])

      // 每次打开弹窗组件获取列表
      watch(patrolTaskVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      async function getList() {
        const res = await getPatrolTask()
        list.value = res.data?.list || []
      }

      const columns = [
        {
          label: '机器人code',
          prop: 'code'
        },
        {
          label: '任务名称',
          prop: 'name'
        },
        {
          label: '巡逻路线',
          prop: 'route'
        },
        {
          label: '巡逻开始时间',
          prop: 'startTime',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.startTime) {
                    return parseTime(row.startTime)
                  }
                }
              }}
            </ElTableColumn>
          )
        },
        {
          label: '巡逻结束时间',
          prop: 'endTime',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.endTime) {
                    return parseTime(row.endTime)
                  }
                }
              }}
            </ElTableColumn>
          )
        },
        {
          label: '任务状态',
          prop: 'status',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.status === 0) {
                    return '完成'
                  } else {
                    return '未完成'
                  }
                }
              }}
            </ElTableColumn>
          )
        },
        {
          label: '任务类型',
          prop: 'type',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.status === 0) {
                    return '普通任务'
                  } else {
                    return '定时任务'
                  }
                }
              }}
            </ElTableColumn>
          )
        }
      ]
      return () => (
        <ElDialog v-model={patrolTaskVisible.value} title={t('xun-luo-ren-wu')} width="80%">
          {{
            default: () => (
              <ElTable height="50vh" data={list.value} highlight-current-row>
                {columns.map((item) =>
                  item.slot ? (
                    item.slot(item)
                  ) : (
                    <ElTableColumn property={item.prop} label={item.label} />
                  )
                )}
                <ElTableColumn label={t('cao-zuo')}>
                  {{
                    default: ({ row }: { row: any }) => (
                      <div>
                        <ElButton>{t('lu-xian')}</ElButton>
                        <ElButton>{t('shi-pin')}</ElButton>
                      </div>
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
    searchDialogVisible,
    PatrolTaskDialog,
    patrolTaskVisible
  }
}
