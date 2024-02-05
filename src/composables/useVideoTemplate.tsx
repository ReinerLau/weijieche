import { ElDialog } from 'element-plus'
import { defineComponent, ref, watch, type Ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// 视频模板
export const useVideoTemplate = (url: Ref<string>) => {
  // 国际化
  const { t } = useI18n()

  // 弹窗是否可见
  const dialogVisible = ref(false)

  //弹窗
  const VideoPlayDialog = defineComponent({
    setup() {
      const videoElement = ref<HTMLVideoElement | null>(null)
      // 监听 url.value 的变化
      watch(url, (newUrl, oldUrl) => {
        // 在变化时停止原先的视频播放
        if (videoElement.value) {
          videoElement.value.pause()
        }
        if (videoElement.value) {
          videoElement.value.src = newUrl
          videoElement.value.load()
        }
      })

      onBeforeUnmount(() => {
        // 组件卸载时停止视频播放并移除视频元素
        if (videoElement.value) {
          videoElement.value.pause()
          videoElement.value.remove()
          url.value = ''
        }
      })

      function handleClose() {
        url.value = ''
        if (videoElement.value) {
          videoElement.value.pause()
        }
      }

      return () => (
        <ElDialog
          v-model={dialogVisible.value}
          title={t('shi-pin')}
          width="50vw"
          align-center
          class="flex flex-col"
          onClose={handleClose}
        >
          <video ref={videoElement} class="w-[50vw] h-[50vh] " muted controls loop>
            <source src={url.value} />
          </video>
        </ElDialog>
      )
    }
  })
  return {
    dialogVisible,
    VideoPlayDialog
  }
}
