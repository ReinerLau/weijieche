<script setup lang="ts">
import { deleteTemplate, getTemplatePathList } from '@/api'
import { clearStatus } from '@/shared/map'
import { clearMenu } from '@/shared/map/base'
import {
  clearRoadnetPathLayer,
  roadnetPathDialogVisible,
  setDrawEndMenu,
  showPath
} from '@/shared/map/roadnet'
import type { PointData, TemplateData } from '@/types'
import { parseTime } from '@/utils/parseTime'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const initialParams = {
  limit: 10,
  page: 1,
  rtype: 'patroling'
}

const params: Record<string, any> = ref(Object.assign({}, initialParams))

const queryFields = [
  {
    prop: 'name',
    title: t('ren-wu-ming-cheng')
  },
  {
    prop: 'memo',
    title: t('bei-zhu')
  }
]

const list = ref<any[]>([])
const total = ref(0)

// 获取列表数据
async function getList() {
  const res = await getTemplatePathList(params.value)
  list.value = res.data.list || []
  total.value = res.data ? res.data.total : 0
}

function handleQuery() {
  getList()
}

function handleReset() {
  params.value = Object.assign({}, initialParams)
  getList()
}

let currentTemplate: []

function onCurrentChange(val: []) {
  currentTemplate = val
}
// 删除模板
async function handleDelete(id: number) {
  await deleteTemplate(id)
  getList()
}

// 路网路线集合
const roadnetPaths: any = ref([])

const onComfirm = () => {
  if (currentTemplate) {
    roadnetPaths.value.length = 0
    clearStatus()
    clearMenu()
    clearRoadnetPathLayer()
    roadnetPaths.value = currentTemplate.map((i: TemplateData) => {
      return JSON.parse(i!.mission)
    })
    roadnetPaths.value.forEach((coordinates: PointData[]) => {
      showPath(coordinates)
    })

    // missionTemplateId.value = currentTemplate.id
    roadnetPathDialogVisible.value = false
    setDrawEndMenu()
  } else {
    ElMessage({
      type: 'warning',
      message: t('wei-xuan-ze-mo-ban')
    })
  }
}

// 每次打开弹窗重新获取数据
watch(roadnetPathDialogVisible, async (val) => {
  if (val) {
    getList()
  }
})

function timeFormatter(row: any) {
  return parseTime(row.createTime)
}
</script>

<template>
  <el-dialog v-model="roadnetPathDialogVisible" :title="t('mo-ban')" width="50vw" align-center>
    <template #header>
      <div class="flex flex-col">
        <span class="mb-3">{{ t('lu-xian-mo-ban') }}</span>
        <el-scrollbar>
          <div class="flex justify-between">
            <div v-for="item in queryFields" :key="item.prop">
              <el-input v-model="params[item.prop]" :placeholder="item.title" clearable></el-input>
            </div>
          </div>
        </el-scrollbar>
        <div class="flex pt-2">
          <el-button type="primary" class="mr-2" @click="handleQuery">{{ t('cha-xun') }}</el-button>
          <el-button type="info" @click="handleReset">{{ t('zhong-zhi') }}</el-button>
        </div>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col">
        <el-table height="50vh" :data="list" @selection-change="onCurrentChange">
          <el-table-column type="selection" width="55" />
          <el-table-column property="name" :label="t('ming-cheng')" />
          <el-table-column property="memo" :label="t('bei-zhu')" />
          <el-table-column
            property="createTime"
            :label="t('chuang-jian-shi-jian')"
            :formatter="timeFormatter"
          />
          <el-table-column :label="t('cao-zuo')">
            <template #default="{ row }">
              <el-button link @click="() => handleDelete(row.id)">
                {{ t('shan-chu') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-2">
          <el-scrollbar class="mt-2">
            <el-pagination
              layout="sizes, prev, pager, next"
              :total="total"
              v-model:current-page="params.page"
              v-model:page-size="params.limit"
              :page-sizes="[10, 20, 50, 100, 200, 500]"
              @sizeChange="getList"
              @currentChange="getList"
            />
          </el-scrollbar>
        </div>
      </div>
    </template>
    <template #footer>
      <el-button size="large" type="primary" class="w-full" @click="onComfirm">{{
        t('que-ding')
      }}</el-button>
    </template>
  </el-dialog>
</template>
