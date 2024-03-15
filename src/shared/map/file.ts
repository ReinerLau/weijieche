import { showPath } from './path'
import { clearDrawTool } from './drawTool'
import { ref } from 'vue'
import { endRecording } from './record'
import type { PointData } from '@/types'
import { clearStatus } from '.'

export const fileUploadDialogVisible = ref(false)

//上传文件后路线显示地图上
export const handleConfirmFilePath = (coordinates: PointData[]) => {
  clearStatus()
  showPath(coordinates)
  fileUploadDialogVisible.value = false
}

export const fileUploadToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    fileUploadDialogVisible.value = true
  }
}
