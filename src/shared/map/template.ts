import { createMissionTemplate, getTemplatePathList } from '@/api'
import type { TemplateData } from '@/types'
import { i18n } from '@/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { getLineCoordinates, havePath } from '.'
import { clearMenu } from './base'
import { clearDrawTool } from './drawTool'
import { clearPathLayer, pathPointsData } from './path'
import { endRecording, isRecordPath, recordPathPoints } from './record'

export interface FormData {
  name?: string
  memo?: string
}

//搜索模板列表

export let currentTemplate: TemplateData | null

export const setCurrentTemplate = (val: TemplateData | null) => {
  currentTemplate = val
}

export const initialParams = {
  limit: 10,
  page: 1,
  rtype: 'patroling'
}

export const queryFields = [
  {
    prop: 'name',
    title: i18n.global.t('ren-wu-ming-cheng')
  },
  {
    prop: 'memo',
    title: i18n.global.t('bei-zhu')
  }
]

export const params: Record<string, any> = ref(Object.assign({}, initialParams))

export const list = ref<any[]>([])
export const total = ref(0)

// 获取列表数据
export async function getList() {
  const res = await getTemplatePathList(params.value)

  list.value = res.data.list || []
  total.value = res.data ? res.data.total : 0
}

// 新建模板的表单数据
export const formData = ref<FormData>({ name: '', memo: '' })

// 确定选择模板路线在地图上显示
export const missionTemplateId = ref<number | null | undefined>()

export const templateDialogVisible = ref(false)
// 确定保存路线模板
export const handleConfirm = async (formList: { name?: string; memo?: string }) => {
  const data = {
    mission: isRecordPath.value
      ? JSON.stringify(getLineCoordinates(recordPathPoints))
      : JSON.stringify(pathPointsData.value),
    name: formList.name,
    memo: formList.memo,
    rtype: 'patroling'
  }
  const res: any = await createMissionTemplate(data)
  ElMessage({
    type: 'success',
    message: res.message
  })
  templateDialogVisible.value = false
  clearPathLayer()
  clearDrawTool()
  isRecordPath.value = false
  recordPathPoints.length = 0
  clearMenu()
}

export const closeTemplate = async () => {
  try {
    await ElMessageBox.confirm(
      i18n.global.t('que-ding-bu-bao-cun-lu-xian-ma'),
      i18n.global.t('ti-shi'),
      {
        confirmButtonText: i18n.global.t('que-ding'),
        cancelButtonText: i18n.global.t('qu-xiao'),
        type: 'warning'
      }
    )

    templateDialogVisible.value = false
    ElMessage({
      type: 'warning',
      message: i18n.global.t('yi-qu-xiao-bao-cun-lu-xian')
    })

    if (isRecordPath.value) {
      clearMenu()
      isRecordPath.value = false
      recordPathPoints.length = 0
    }
  } catch (error) {
    return error
  }
}

// 搜索模板弹窗是否可见
export const templateSearchDialogVisible = ref(false)

export const saveTemplateToolbarEvent = () => {
  if (havePath() && endRecording()) {
    clearDrawTool()
    templateDialogVisible.value = true
  }
}

export const searchTemplateToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    templateSearchDialogVisible.value = true
  }
}
