import { ElDialog } from 'element-plus'
import TestComponent from './components/TestComponent.vue'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ElDialog: typeof ElDialog
    TestComponent: typeof TestComponent
  }
}
