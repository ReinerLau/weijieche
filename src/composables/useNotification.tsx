import { getToken } from '@/utils'
import { ElAlert, ElBadge, ElButton, ElCard, ElDrawer, ElNotification } from 'element-plus'
import { Fragment, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import IconMdiBellOutline from '~icons/mdi/bell-outline'
import IconCloseFill from '~icons/mingcute/close-fill'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
interface websocketData {
  id: string
  type: string
  message: string
  time?: string
}
export const useNotification = () => {
  const notificationDrawerVisible = ref(false)
  const notifications: websocketData[] = reactive([])

  const { t } = useI18n()

  function initWebsocket() {
    const token = getToken()
    if (token) {
      const websocket = new WebSocket(`ws://${window.location.host}/websocket`, [token])
      websocket.onmessage = onMessage
      websocket.onopen = () => {
        isOpen.value = true
      }
      websocket.onclose = () => {
        isOpen.value = false
      }
      websocket.onerror = () => {
        isOpen.value = false
      }
      return websocket
    }
  }
  const alarmRef: Ref<HTMLMediaElement | undefined> = ref()

  function onMessage(e: any) {
    const data: websocketData = JSON.parse(e.data)
    const { type, message } = data
    ElNotification({
      type: type as 'warning' | 'error',
      message,
      position: 'bottom-right'
    })
    notifications.push(data)
    alarmRef.value && alarmRef.value.play()
  }

  let websocket: WebSocket | undefined
  const isOpen = ref(false)

  onMounted(() => {
    websocket = initWebsocket()
  })

  onBeforeUnmount(() => {
    websocket?.close()
  })

  const NotificationDrawer = () => (
    <ElDrawer
      title={t('tong-zhi')}
      class="select-none"
      v-model={notificationDrawerVisible.value}
      direction="rtl"
      size="80%"
    >
      {!isOpen.value && (
        <ElAlert title={t('websocket-lian-jie-yi-duan-kai')} type="error" class="!mb-5" />
      )}
      {notifications.map((item, index) => (
        <ElCard key={item.id} class="mb-5">
          {{
            header: () => (
              <div class="flex justify-between">
                <span>{item.time}</span>
                <ElButton link onClick={() => notifications.splice(index, 1)}>
                  <IconCloseFill />
                </ElButton>
              </div>
            ),
            default: () => <div>{item.message}</div>
          }}
        </ElCard>
      ))}
    </ElDrawer>
  )

  const NotificationController = () => (
    <Fragment>
      <ElButton link onClick={() => (notificationDrawerVisible.value = true)}>
        <ElBadge value={notifications.length} hidden={notifications.length === 0} isDot={true}>
          <IconMdiBellOutline />
        </ElBadge>
      </ElButton>
      <audio ref={alarmRef} src="/unionAlarm.wav" hidden></audio>
    </Fragment>
  )
  return {
    NotificationDrawer,
    NotificationController
  }
}
