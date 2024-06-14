import { ElButton, ElDialog, ElOption, ElSelect } from 'element-plus'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ElDialog: typeof ElDialog
    ElButton: typeof ElButton
    ElSelect: typeof ElSelect
    ElOption: typeof ElOption
  }
}
