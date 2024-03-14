import { alarmDialogVisible } from '@/shared/map/alarm'
import { ElButton, ElDialog, ElImage } from 'element-plus'
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// 模板相关
export const useTemplate = () => {
  // 国际化
  // https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  const { t } = useI18n()

  //警报弹窗

  async function handleAlarm() {
    alarmDialogVisible.value = false
  }
  const TemplateAlarmDialog = defineComponent({
    emits: ['confirm'],
    props: {
      wsdata: {
        type: Object,
        required: true
      }
    },
    setup(props) {
      const srcList: string[] = []
      const imgUrl = ref<string>('')
      watch(props, (val) => {
        imgUrl.value = ''
        srcList.length = 0
        imgUrl.value = val.wsdata.picPath
        srcList.push(val.wsdata.picPath)
      })

      return () => (
        <ElDialog
          v-model={alarmDialogVisible.value}
          title={props.wsdata.message}
          width="500"
          class=" !mr-[1vw]"
          // align-center
          draggable={true}
        >
          {{
            default: () => (
              <div class="flex items-center justify-around ">
                <ElImage
                  class="w-28 h-28"
                  src={imgUrl.value}
                  fit="cover"
                  zoom-rate={1.2}
                  max-scale={7}
                  min-scale={0.2}
                  preview-src-list={srcList}
                  initial-index={0}
                />
              </div>
            ),
            footer: () => (
              <div class="flex justify-between">
                <ElButton size="large" class="w-full" onClick={handleAlarm}>
                  {t('bu-zuo-chu-li')}
                </ElButton>
                <ElButton
                  size="large"
                  type="primary"
                  class="w-full"
                  onClick={() => (alarmDialogVisible.value = false)}
                >
                  {t('shou-dong-chu-li')}
                </ElButton>
              </div>
            )
          }}
        </ElDialog>
      )
    }
  })
  return {
    TemplateAlarmDialog,
    alarmDialogVisible,
    handleAlarm
  }
}
