import { ElDialog, ElImage } from 'element-plus'
import { defineComponent, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 画面模板
export const useShowCamera = (cameraList: Ref<string[]>) => {
  // 国际化
  const { t } = useI18n()

  // 弹窗是否可见
  const dialogVisible = ref(false)
  //弹窗
  const ShowCameraDialog = defineComponent({
    setup() {
      return () => (
        <ElDialog
          v-model={dialogVisible.value}
          title={t('hua-mian')}
          width="50vw"
          align-center
          class="flex flex-col"
          close-on-press-escape={false}
        >
          <div>
            {cameraList.value.map((item) => (
              <ElImage
                key={item}
                class="w-24 h-24"
                src={item}
                zoom-rate={1.2}
                max-scale={7}
                min-scale={0.2}
                preview-src-list={cameraList}
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
    dialogVisible,
    ShowCameraDialog
  }
}
