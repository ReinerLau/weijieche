import { ElDialog, ElImage } from 'element-plus'
import { defineComponent, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 画面模板
export const useShowCamera = (cameraList: any) => {
  // 国际化
  const { t } = useI18n()

  // 弹窗是否可见
  const showCameraDialogVisible = ref(false)
  //弹窗
  const ShowCameraDialog = defineComponent({
    setup() {
      return () => (
        <ElDialog
          v-model={showCameraDialogVisible.value}
          title={t('hua-mian')}
          width="50vw"
          align-center
          class="flex flex-col"
          close-on-press-escape={false}
        >
          <div>
            {cameraList.value.map((item: any) => (
              <ElImage
                key={item}
                class="w-24 h-24 m-2"
                src={item}
                zoom-rate={1.2}
                max-scale={7}
                min-scale={0.2}
                preview-src-list={cameraList.value}
                initial-index={0}
                fit="cover"
              />
            ))}
          </div>
        </ElDialog>
      )
    }
  })
  return {
    showCameraDialogVisible,
    ShowCameraDialog
  }
}
