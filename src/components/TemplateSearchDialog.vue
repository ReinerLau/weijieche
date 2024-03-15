<script setup lang="ts">
import { deleteTemplate, getTemplatePathList } from '@/api'
import { clearStatus } from '@/shared/map'
import { showPath } from '@/shared/map/path'
import { missionTemplateId, templateSearchDialogVisible } from '@/shared/map/template'
import type { PointData, TemplateData } from '@/types'
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

let currentTemplate: TemplateData

function onCurrentChange(val: TemplateData) {
  currentTemplate = val
}
// 删除模板
async function handleDelete(id: number) {
  await deleteTemplate(id)
  getList()
}

const onComfirm = () => {
  if (currentTemplate) {
    clearStatus()
    const coordinates = getCoordinates()
    showPath(coordinates)
    missionTemplateId.value = currentTemplate.id
    templateSearchDialogVisible.value = false
  } else {
    ElMessage({
      type: 'warning',
      message: t('wei-xuan-ze-mo-ban')
    })
  }
}

const getCoordinates = (): PointData[] => {
  return JSON.parse(currentTemplate!.mission)
}

// 每次打开搜索弹窗重新获取数据
watch(templateSearchDialogVisible, async (val) => {
  if (val) {
    getList()
  }
})
</script>

<template>
  <el-dialog v-model="templateSearchDialogVisible" :title="t('mo-ban')" width="50vw" align-center>
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
        <el-table height="50vh" :data="list" highlight-current-row @currentChange="onCurrentChange">
          <el-table-column property="name" :label="t('ming-cheng')" />
          <el-table-column property="memo" :label="t('bei-zhu')" />
          <el-table-column property="createTime" :label="t('chuang-jian-shi-jian')" />
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
