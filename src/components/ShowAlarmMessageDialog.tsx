import { showAlarmDialogVisible } from '@/shared/map/alarmPoint'
import { parseTime } from '@/utils/parseTime'
import { ElDialog, ElImage } from 'element-plus'
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    alarmMessage: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    const alarmPointMessage = ref({})
    const imgUrl = ref<string>('')
    const srcList: string[] = []
    // 每次打开弹窗组件获取列表
    watch(showAlarmDialogVisible, async (val) => {
      if (val) {
        alarmPointMessage.value = props.alarmMessage
      }
    })

    watch(
      () => props.alarmMessage.picPath,
      (val) => {
        imgUrl.value = ''
        srcList.length = 0
        imgUrl.value = val
        srcList.push(val)
      }
    )

    return () => (
      <ElDialog
        v-model={showAlarmDialogVisible.value}
        title={t('yi-chang-xiang-qing')}
        width="50vw"
        align-center
        class="flex flex-col"
        close-on-press-escape={false}
      >
        <div class="grid gap-2 grid-cols-2 grid-rows-2 w-full h-24 mr-4 text-base">
          <p>
            {t('jing-du')}: {props.alarmMessage.longitude || 0}
          </p>
          <p>
            {t('wei-du')}:{props.alarmMessage.latitude || 0}
          </p>
          <p>
            {t('tong-zhi-shi-jian')}: {parseTime(props.alarmMessage.noticeTime) || 0}
          </p>
          <p>
            {t('shi-ji-fa-xian-shi-jian')}: {parseTime(props.alarmMessage.actualTime) || 0}
          </p>
          <p v-show={props.alarmMessage.hole}>
            {t('tie-si-wang-po-kong-jian-ce')}: {props.alarmMessage.hole ? t('you') : t('wu')}
          </p>
          <p v-show={props.alarmMessage.personnelIntrusion}>
            {t('ren-yuan-ru-qin')}: {props.alarmMessage.personnelIntrusion ? t('you') : t('wu')}
          </p>
          <p v-show={props.alarmMessage.salute}>
            {t('jing-li-shi-bie')}: {props.alarmMessage.salute ? t('you') : t('wu')}
          </p>
        </div>

        <ElImage
          class="w-28 h-28 my-4"
          src={imgUrl.value}
          zoom-rate={1.2}
          max-scale={7}
          min-scale={0.2}
          preview-src-list={srcList}
          initial-index={0}
          fit="cover"
        />
      </ElDialog>
    )
  }
})
