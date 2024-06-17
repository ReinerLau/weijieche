import CamerPlayer from '@/components/CameraPlayer.vue'
import { ElButton, ElDialog, ElOption, ElSelect } from 'element-plus'

export type CameraPlayerInstance = InstanceType<typeof CamerPlayer>

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ElDialog: typeof ElDialog
    ElButton: typeof ElButton
    ElSelect: typeof ElSelect
    ElOption: typeof ElOption
  }
}
