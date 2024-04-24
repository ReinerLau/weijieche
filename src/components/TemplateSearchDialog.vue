<script setup lang="ts">
import { deleteTemplate } from '@/api'
import { clearStatus } from '@/shared/map'
import { showPath } from '@/shared/map/path'
import {
  currentTemplate,
  getList,
  initialParams,
  list,
  missionTemplateId,
  params,
  queryFields,
  setCurrentTemplate,
  templateSearchDialogVisible,
  total
} from '@/shared/map/template'
import type { PointData, TemplateData } from '@/types'
import {
  ElButton,
  ElDialog,
  ElInput,
  ElMessage,
  ElPagination,
  ElScrollbar,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

function handleQuery() {
  getList()
}

function handleReset() {
  params.value = Object.assign({}, initialParams)
  getList()
}

function onCurrentChange(val: TemplateData) {
  setCurrentTemplate(val)
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
    handleReset()
  }
})
</script>

<template>
  <ElDialog v-model="templateSearchDialogVisible" :title="t('mo-ban')" width="50vw" align-center>
    <template #header>
      <div class="flex flex-col">
        <span class="mb-3">{{ t('lu-xian-mo-ban') }}</span>
        <ElScrollbar>
          <div class="flex justify-between">
            <div v-for="item in queryFields" :key="item.prop">
              <ElInput v-model="params[item.prop]" :placeholder="item.title" clearable></ElInput>
            </div>
          </div>
        </ElScrollbar>
        <div class="flex pt-2">
          <ElButton type="primary" class="mr-2" @click="handleQuery">{{ t('cha-xun') }}</ElButton>
          <ElButton type="info" @click="handleReset">{{ t('zhong-zhi') }}</ElButton>
        </div>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col">
        <ElTable height="50vh" :data="list" highlight-current-row @currentChange="onCurrentChange">
          <ElTableColumn property="name" :label="t('ming-cheng')" />
          <ElTableColumn property="memo" :label="t('bei-zhu')" />
          <ElTableColumn property="createTime" :label="t('chuang-jian-shi-jian')" />
          <ElTableColumn :label="t('cao-zuo')">
            <template #default="{ row }">
              <ElButton link @click="() => handleDelete(row.id)">
                {{ t('shan-chu') }}
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="flex justify-end mt-2">
          <ElScrollbar class="mt-2">
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
      </div>
    </template>
    <template #footer>
      <ElButton size="large" type="primary" class="w-full" @click="onComfirm">{{
        t('que-ding')
      }}</ElButton>
    </template>
  </ElDialog>
</template>
