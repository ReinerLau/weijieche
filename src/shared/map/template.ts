import { ref } from 'vue'
import { clearDrawTool } from './drawTool'
import { clearPathLayer, pathPointsData } from './path'
import { endRecording, isRecordPath, recordPathPoints } from './record'
import { getLineCoordinates, havePath } from '.'
import { createMissionTemplate } from '@/api'
import { ElMessage } from 'element-plus'

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
