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
  ElInput,
  ElMessage,
  ElOption,
  ElPagination,
  ElScrollbar,
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
import { useVideoTemplate } from '@/composables'

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
    emits: ['confirm'],
    setup(props, { emit }) {
      const list: Ref<any[]> = ref([])
      // 每次打开弹窗组件获取列表
      watch(patrolTaskVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      const initialParams = {
        limit: 10,
        page: 1
      }

      const params: Record<string, any> = ref(Object.assign({}, initialParams))

      const total = ref(0)

      async function getList(): Promise<void> {
        const res = await getPatrolTask(params.value)
        list.value = res.data?.list || []
        total.value = res.data ? res.data.total : 0
      }

      function handleQuery() {
        getList()
      }

      function handleReset() {
        params.value = Object.assign({}, initialParams)
        getList()
      }

      const statusType = {
        0: t('wan-cheng'),
        1: t('wei-wan-cheng')
      }

      const taskType = {
        0: t('pu-tong-ren-wu'),
        1: t('ding-shi-ren-wu')
      }

      const queryFields = [
        {
          prop: 'status',
          title: t('ren-wu-zhuang-tai'),
          slot: (params: any) => (
            <ElSelect
              size="small"
              class=" w-48"
              v-model={params.value['status']}
              placeholder={t('ren-wu-zhuang-tai')}
              clearable
            >
              {Object.entries(statusType).map(([value, label]) => (
                <ElOption key={value} label={label} value={value}></ElOption>
              ))}
            </ElSelect>
          )
        },
        {
          prop: 'type',
          title: t('ren-wu-lei-xing'),
          slot: (params: any) => (
            <ElSelect
              size="small"
              class=" w-48"
              v-model={params.value['type']}
              placeholder={t('ren-wu-lei-xing')}
              clearable
            >
              {Object.entries(taskType).map(([value, label]) => (
                <ElOption key={value} label={label} value={value}></ElOption>
              ))}
            </ElSelect>
          )
        },
        {
          prop: 'startTime',
          title: t('xun-luo-kai-shi-shi-jian'),
          slot: (params: any) => (
            <ElDatePicker
              size="small"
              v-model={params.value['startTime']}
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder={t('xun-luo-kai-shi-shi-jian')}
            />
          )
        },
        {
          prop: 'endTime',
          title: t('xun-luo-jie-shu-shi-jian'),
          slot: (params: any) => (
            <ElDatePicker
              size="small"
              v-model={params.value['endTime']}
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder={t('xun-luo-jie-shu-shi-jian')}
            />
          )
        }
      ]

      const columns = [
        {
          label: t('ji-qi-ren-code'),
          prop: 'code'
        },
        {
          label: t('ren-wu-ming-cheng'),
          prop: 'name'
        },
        {
          label: t('xun-luo-kai-shi-shi-jian'),
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
          label: t('xun-luo-jie-shu-shi-jian'),
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
          label: t('ren-wu-zhuang-tai'),
          prop: 'status',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.status === 0) {
                    return t('wan-cheng')
                  } else {
                    return t('wei-wan-cheng')
                  }
                }
              }}
            </ElTableColumn>
          )
        },
        {
          label: t('ren-wu-lei-xing'),
          prop: 'type',
          slot: (row: any) => (
            <ElTableColumn property={row.prop} label={row.label}>
              {{
                default: ({ row }: { row: any }) => {
                  if (row.type === 1) {
                    return t('ding-shi-ren-wu')
                  } else {
                    return t('pu-tong-ren-wu')
                  }
                }
              }}
            </ElTableColumn>
          )
        }
      ]

      //清空搜索框
      function handleVisible() {
        params.value = Object.assign({}, initialParams)
      }

      //打开视频
      const cameraUrl = ref('')

      const { dialogVisible: videoDialogVisible, VideoPlayDialog } = useVideoTemplate(cameraUrl)

      function handleConfirmVideo(row: any) {
        videoDialogVisible.value = true
        cameraUrl.value = row.videoPath
      }

      return () => (
        <div>
          <ElDialog
            v-model={patrolTaskVisible.value}
            onClose={handleVisible}
            title={t('xun-luo-ren-wu')}
            width="80%"
          >
            {{
              header: () => (
                <div class=" flex flex-col ">
                  <span class="mb-3">{t('xun-luo-ren-wu')}</span>
                  <ElScrollbar>
                    <div class="flex justify-between">
                      {queryFields.map((item) => (
                        <div>
                          {item.slot ? (
                            item.slot(params)
                          ) : (
                            <ElInput
                              v-model={params.value[item.prop]}
                              placeholder={item.title}
                              clearable
                            ></ElInput>
                          )}
                        </div>
                      ))}
                    </div>
                  </ElScrollbar>
                  <div class="flex pt-2">
                    <ElButton type="primary" class="mr-2" onClick={handleQuery}>
                      {t('cha-xun')}
                    </ElButton>
                    <ElButton type="info" onClick={handleReset}>
                      {t('zhong-zhi')}
                    </ElButton>
                  </div>
                </div>
              ),
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
                          <ElButton onClick={() => emit('confirm', row)}>{t('lu-xian')}</ElButton>
                          <ElButton onClick={() => handleConfirmVideo(row)}>
                            {t('shi-pin')}
                          </ElButton>
                        </div>
                      )
                    }}
                  </ElTableColumn>
                </ElTable>
              ),
              footer: () => (
                <div class="flex justify-end mt-2">
                  <ElScrollbar>
                    <ElPagination
                      layout="sizes, prev, pager, next"
                      total={total.value}
                      v-model:current-page={params.value.page}
                      v-model:page-size={params.value.limit}
                      page-sizes={[10, 20, 50, 100, 200, 500]}
                      onSize-change={getList}
                      onCurrent-change={getList}
                    />
                  </ElScrollbar>
                </div>
              )
            }}
          </ElDialog>
          <VideoPlayDialog />
        </div>
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
