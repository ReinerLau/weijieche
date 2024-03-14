import {} from '@/shared'
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
  ElTableColumn,
  ElUpload,
  type UploadInstance
} from 'element-plus'
// 深拷贝
// https://lodash.com/docs/4.17.15#cloneDeep
import { defineComponent, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPatrolTask } from '@/api'
import { getToken, parseTime } from '@/utils'
import { useVideoTemplate, useShowCamera } from '@/composables'
import { patrolTaskDialogVisible, searchDialogVisible } from '@/shared/map/patrolPath'
import { fileUploadDialogVisible } from '@/shared/map/file'

// 定时任务相关
export const useSchedule = () => {
  // 国际化
  // https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  const { t } = useI18n()

  //巡逻任务列表
  const PatrolTaskDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      const list: Ref<any[]> = ref([])
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

      return () => (
        <div>
          <ElDialog
            v-model={patrolTaskDialogVisible.value}
            onClose={handleVisible}
            title={t('xun-luo-ren-wu')}
            width="50vw"
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
                        <div>
                          <ElButton onClick={() => emit('confirm', row)}>{t('lu-xian')}</ElButton>
                          <ElButton onClick={() => handleConfirmVideo(row)}>
                            {t('shi-pin')}
                          </ElButton>
                          <ElButton onClick={() => handleConfirmCamera(row)}>
                            {t('hua-mian')}
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

  const FileUploadDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      const uploadRef = ref<UploadInstance | null>(null)
      const submitUpload = () => {
        if (uploadRef.value) {
          uploadRef.value.submit()
        }
      }

      const fileData = ref({})
      const handleSuccess = (response: any) => {
        fileData.value = response.data
        emit('confirm', fileData.value)
      }

      const beforeAvatarUpload = (rawFile: any) => {
        const fileExtension = rawFile.name.split('.').pop().toLowerCase()
        if (fileExtension !== 'plan') {
          ElMessage.error(t('qing-shang-chuan-zheng-que-de-lu-xian-wen-jian'))
          return false
        }
        ElMessage({
          type: 'success',
          message: t('shang-chuan-cheng-gong')
        })
        return true
      }

      const handleClose = () => {
        // 关闭弹窗时重置上传组件的状态
        if (uploadRef.value) {
          uploadRef.value.clearFiles() // 清空上传的文件
        }
        fileUploadDialogVisible.value = false // 关闭弹窗
      }
      return () => (
        <ElDialog
          v-model={fileUploadDialogVisible.value}
          title={t('shang-chuan-wen-jian')}
          width="50vw"
          align-center
          onClose={handleClose}
        >
          {{
            default: () => (
              <ElUpload
                ref={uploadRef}
                headers={{ Authorization: getToken() }}
                action={`http://${window.location.host}/api/vehicle-task/v1/plan/parse`}
                limit={1}
                auto-upload={false}
                on-success={handleSuccess}
                before-upload={beforeAvatarUpload}
              >
                <ElButton type="primary">{t('xuan-ze-lu-xian-wen-jian')}</ElButton>
              </ElUpload>
            ),
            footer: () => (
              <ElButton size="large" type="primary" class="w-full" onClick={submitUpload}>
                {t('shang-chuan-lu-xian')}
              </ElButton>
            )
          }}
        </ElDialog>
      )
    }
  })
  return {
    searchDialogVisible,
    PatrolTaskDialog,
    FileUploadDialog
  }
}
