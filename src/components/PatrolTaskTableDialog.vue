<template>
  <ElDialog v-model="patrolTaskDialogVisible" @close="handleVisible" width="70vw" align-center>
    <template #header>
      <div class="flex flex-col">
        <span class="mb-3">{{ t('xun-luo-ren-wu') }}</span>
        <ElScrollbar>
          <div class="flex justify-between">
            <ElSelect
              class="w-48"
              v-model="params['status']"
              :placeholder="t('ren-wu-zhuang-tai')"
              clearable
            >
              <ElOption
                v-for="(value, key, index) in statusType"
                :key="index"
                :label="value"
                :value="key"
              ></ElOption>
            </ElSelect>
            <ElSelect
              class="w-48"
              v-model="params['type']"
              :placeholder="t('ren-wu-lei-xing')"
              clearable
            >
              <ElOption
                v-for="(value, key, index) in taskType"
                :key="index"
                :label="value"
                :value="key"
              ></ElOption>
            </ElSelect>
            <ElDatePicker
              v-model="params['startTime']"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :placeholder="t('xun-luo-kai-shi-shi-jian')"
            />
            <ElDatePicker
              v-model="params['endTime']"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :placeholder="t('xun-luo-jie-shu-shi-jian')"
            />
          </div>
        </ElScrollbar>
        <div class="flex pt-2">
          <ElButton type="primary" class="mr-2" :onClick="handleQuery">
            {{ t('cha-xun') }}
          </ElButton>
          <ElButton type="info" :onClick="handleReset"> {{ t('zhong-zhi') }} </ElButton>
        </div>
      </div>
    </template>
    <template #default>
      <ElTable height="50vh" :data="list" highlight-current-row>
        <TableColumn></TableColumn>
      </ElTable>
    </template>
    <template #footer>
      <div class="flex justify-end mt-2">
        <ElScrollbar>
          <ElPagination
            layout="sizes, prev, pager, next"
            :total="total"
            v-model:current-page="params.page"
            v-model:page-size="params.limit"
            :page-sizes="[10, 20, 50, 100, 200, 500]"
            @sizeChange="getList"
            @currentChange="getList"
          />
        </ElScrollbar>
      </div>
    </template>
  </ElDialog>
</template>
<script setup lang="tsx">
import { downloadVideo, getPatrolTask, getTaskWarning } from '@/api'
import { handleConfirmAlarmPoint } from '@/shared/map/alarmPoint'
import {
  clearDrawPatrolLine,
  handleConfirmPatrolTaskPath,
  patrolTaskDialogVisible
} from '@/shared/map/patrolPath'
import { parseTime } from '@/utils/parseTime'
import {
  ElDialog,
  ElButton,
  ElDatePicker,
  ElMessage,
  ElOption,
  ElPagination,
  ElScrollbar,
  ElSelect,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { Fragment, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const emit = defineEmits<{
  cameraConfirm: any
  videoConfirm: any
}>()

const initialParams = {
  limit: 10,
  page: 1
}
const params: Record<string, any> = ref(Object.assign({}, initialParams))
const total = ref(0)
const list = ref<any[]>([])
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

// 每次打开弹窗组件获取列表
watch(patrolTaskDialogVisible, async (val) => {
  if (val) {
    getList()
  }
})

const statusType = {
  0: t('wan-cheng'),
  1: t('wei-wan-cheng')
}

const taskType = {
  0: t('pu-tong-ren-wu'),
  1: t('ding-shi-ren-wu')
}

const TableColumn = () => (
  <Fragment>
    {columns.map((item) => (
      <ElTableColumn property={item.prop} label={item.label}>
        {{ default: ({ row }: any) => (item.slot ? item.slot(row) : null) }}
      </ElTableColumn>
    ))}
    <ElTableColumn label={t('cao-zuo')}>
      {{
        default: ({ row }: { row: any }) => (
          <div class="felx flex-col">
            <ElButton onClick={() => handleConfirmPatrolTaskPath(row)}>
              {t('cha-kan-lu-xian')}
            </ElButton>
            <ElButton onClick={() => emit('cameraConfirm', row)}>{t('ren-wu-hua-mian')}</ElButton>
            <ElButton onClick={() => emit('videoConfirm', row)}>{t('ren-wu-shi-pin')}</ElButton>
            <ElButton onClick={() => handleConfirmAlarm(row)}>{t('yi-chang-wei-zhi')}</ElButton>
            <ElButton onClick={() => handleUploadVideo(row)}>{t('cun-chu-shi-pin')}</ElButton>
          </div>
        )
      }}
    </ElTableColumn>
  </Fragment>
)

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
    slot: (row: any) => {
      if (row.startTime) {
        return parseTime(row.startTime)
      } else {
        return null
      }
    }
  },
  {
    label: t('xun-luo-jie-shu-shi-jian'),
    prop: 'endTime',
    slot: (row: any) => {
      if (row.endTime) {
        return parseTime(row.endTime)
      }
    }
  },
  {
    label: t('ren-wu-zhuang-tai'),
    prop: 'status',
    slot: (row: any) => {
      if (row.status === 0) {
        return t('wan-cheng')
      } else {
        return t('wei-wan-cheng')
      }
    }
  },
  {
    label: t('ren-wu-lei-xing'),
    prop: 'type',
    slot: (row: any) => {
      if (row.type === 1) {
        return t('ding-shi-ren-wu')
      } else {
        return t('pu-tong-ren-wu')
      }
    }
  },
  {
    label: t('shi-pin-zhuang-tai'),
    prop: 'downloadFlag',
    slot: (row: any) => {
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
  }
]

//清空搜索框
function handleVisible() {
  params.value = Object.assign({}, initialParams)
}

//保存视频
async function handleUploadVideo(row: any) {
  await downloadVideo(row.id)
  ElMessage({
    type: 'success',
    message: t('cao-zuo-cheng-gong')
  })
}

//打开展示异常位置
async function handleConfirmAlarm(row: any) {
  const { data } = await getTaskWarning(row.id)
  clearDrawPatrolLine()
  handleConfirmPatrolTaskPath(row)
  handleConfirmAlarmPoint(data)
}
</script>
