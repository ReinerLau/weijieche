import { ref } from 'vue'
import { clearDrawTool } from './drawTool'
import { clearPathLayer, pathPointsData } from './path'
import { endRecording, isRecordPath, recordPathPoints } from './record'
import { getLineCoordinates, havePath } from '.'
import { createMissionTemplate } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { i18n } from '@/utils'
import { clearMenu, map } from './base'

// 确定选择模板路线在地图上显示
export const missionTemplateId = ref<number | null | undefined>()

export const templateDialogVisible = ref(false)
// 确定保存路线模板
export const handleConfirm = async (formData: { name?: string; memo?: string }) => {
  const data = {
    mission: isRecordPath.value
      ? JSON.stringify(getLineCoordinates(recordPathPoints))
      : JSON.stringify(pathPointsData.value),
    name: formData.name,
    memo: formData.memo,
    rtype: 'patroling'
  }
  const res: any = await createMissionTemplate(data)
  ElMessage.success({
    message: res.message
  })
  templateDialogVisible.value = false
  clearPathLayer()
  clearDrawTool()
  isRecordPath.value = false
  recordPathPoints.length = 0
  clearMenu()
}

export const closeTemplate = (done: () => void) => {
  ElMessageBox.confirm(i18n.global.t('que-ding-bu-bao-cun-lu-xian-ma'), i18n.global.t('ti-shi'), {
    confirmButtonText: i18n.global.t('que-ding'),
    cancelButtonText: i18n.global.t('qu-xiao'),
    type: 'warning'
  })
    .then(() => {
      done()
      ElMessage.warning({
        message: i18n.global.t('yi-qu-xiao-bao-cun-lu-xian')
      })
      if (isRecordPath.value) {
        clearMenu()
        isRecordPath.value = false
        recordPathPoints.length = 0
      }
    })
    .catch(() => {})
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
