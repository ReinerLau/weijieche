import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { i18n } from '@/utils'
import { Marker, VectorLayer } from 'maptalks'
import { map } from './base'

export const isRecord = ref(false)
export const isRecordPath = ref(false)
//录制路线图层实例
export let recordPathLayer: VectorLayer
// 校验地图是否已结束录制路线
export const endRecording = () => {
  if (isRecord.value) {
    ElMessage({
      type: 'error',
      message: i18n.global.t('qing-xian-jie-shu-lu-zhi')
    })
    return false
  } else {
    return true
  }
}

export const initRecordPathLayer = () => {
  recordPathLayer = new VectorLayer('record-point')
  recordPathLayer.addTo(map)
}
export const recordPathPoints: Marker[] = []
