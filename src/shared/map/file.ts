import { setEntryPoint } from './home'
import { clearPathLayer, pathPointList, showPath } from './path'
import { clearDrawTool } from './drawTool'
import { ref } from 'vue'
import { endRecording } from './record'
import type { PointData } from '@/types'

export const fileUploadDialogVisible = ref(false)

//上传文件后路线显示地图上
export const handleConfirmFilePath = (coordinates: PointData[]) => {
  setEntryPoint(null)
  pathPointList.length = 0
  clearDrawTool()
  clearPathLayer()
  fileUploadDialogVisible.value = false
  showPath(coordinates)
}

export const fileUploadToolbarEvent = () => {
  if (endRecording()) {
    clearDrawTool()
    fileUploadDialogVisible.value = true
  }
}
