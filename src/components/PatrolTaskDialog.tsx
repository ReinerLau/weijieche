import { downloadVideo, getPatrolTask, getTaskWarning } from '@/api'
import { useShowCamera, useVideoTemplate } from '@/composables'
import { handleConfirmAlarmPoint } from '@/shared/map/alarmPoint'
import {
  clearDrawPatrolLine,
  handleConfirmPatrolTaskPath,
  patrolTaskDialogVisible
} from '@/shared/map/patrolPath'
import { parseTime } from '@/utils'
import {
  ElButton,
  ElDatePicker,
  ElDialog,
  ElMessage,
  ElOption,
  ElPagination,
  ElScrollbar,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  emits: ['confirm'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const list = ref<any[]>([])
    // 每次打开弹窗组件获取列表
    watch(patrolTaskDialogVisible, async (val) => {
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
        title: t('xun-luo-kai-shi-shi-jian')
      },
      {
        prop: 'endTime',
        title: t('xun-luo-jie-shu-shi-jian')
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
      },
      {
        label: t('shi-pin-zhuang-tai'),
        prop: 'downloadFlag',
        slot: (row: any) => (
          <ElTableColumn property={row.prop} label={row.label}>
            {{
              default: ({ row }: { row: any }) => {
                if (row.downloadFlag === 1) {
                  return t('wei-xia-zai')
                } else if (row.downloadFlag === 2) {
                  return t('yi-xia-zai')
                } else if (row.downloadFlag === 3) {
                  return t('xia-zai-zhong')
                } else {
                  return t('wu')
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
      cameraUrl.value = ''
      videoDialogVisible.value = true
      cameraUrl.value = row.videoPath
    }

    //保存视频
    async function handleUploadVideo(row: any) {
      await downloadVideo(row.id)
      ElMessage({
        type: 'success',
        message: t('cao-zuo-cheng-gong')
      })
      // patrolTaskDialogVisible.value = false
    }

    //打开摄像画面
    const cameraList: any = ref([])

    const { showCameraDialogVisible, ShowCameraDialog } = useShowCamera(cameraList)

    function handleConfirmCamera(row: any) {
      cameraList.value.length = 0
      showCameraDialogVisible.value = true
      if (row.picPath) {
        cameraList.value = row.picPath
      } else {
        cameraList.value.length = 0
      }
    }

    //打开展示异常位置
    async function handleConfirmAlarm(row: any) {
      const { data } = await getTaskWarning(row.id)
      clearDrawPatrolLine()

      handleConfirmPatrolTaskPath(row)
      handleConfirmAlarmPoint(data)
    }
    return () => (
      <div>
        <ElDialog
          v-model={patrolTaskDialogVisible.value}
          onClose={handleVisible}
          title={t('xun-luo-ren-wu')}
          width="70vw"
          align-center
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
                          <ElDatePicker
                            v-model={params.value[item.prop]}
                            type="datetime"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            placeholder={item.title}
                          />
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
                      <div class="felx flex-col">
                        <ElButton onClick={() => emit('confirm', row)}>
                          {t('cha-kan-lu-xian')}
                        </ElButton>
                        <ElButton onClick={() => handleConfirmCamera(row)}>
                          {t('ren-wu-hua-mian')}
                        </ElButton>
                        <ElButton onClick={() => handleConfirmVideo(row)}>
                          {t('ren-wu-shi-pin')}
                        </ElButton>
                        <ElButton onClick={() => handleConfirmAlarm(row)}>
                          {t('yi-chang-wei-zhi')}
                        </ElButton>
                        <ElButton onClick={() => handleUploadVideo(row)}>
                          {t('cun-chu-shi-pin')}
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
        <ShowCameraDialog />
      </div>
    )
  }
})
