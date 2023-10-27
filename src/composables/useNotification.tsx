import { getToken } from '@/utils'
import {
  ElAlert,
  ElBadge,
  ElButton,
  ElCard,
  ElDrawer,
  ElMessage,
  ElNotification,
  ElScrollbar
} from 'element-plus'
import { Fragment, onBeforeUnmount, onMounted, ref } from 'vue'
import IconMdiBellOutline from '~icons/mdi/bell-outline'
import IconCloseFill from '~icons/mingcute/close-fill'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteLog, getAllLog } from '@/api'
import { useVirtualList } from '@vueuse/core'
import { remove } from 'lodash'
interface websocketData {
  id: string
  type: string
  message: string
  createTime?: string
}
export const useNotification = () => {
  const notificationDrawerVisible = ref(false)
  const notifications: Ref<websocketData[]> = ref([])

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
    notifications.value.push(data)
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

  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(notifications, {
    itemHeight: 125
  })

  async function lookMore() {
    const res = await getAllLog()
    notifications.value = res.data || []
    scrollTo(0)
  }

  async function delLog(id: string) {
    const res: any = await deleteLog(id)
    ElMessage({
      type: 'success',
      message: res.message
    })
    getAllLog()
    remove(list.value, (item) => item.data.id === id)
  }

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
      <div class="text-right">
        <ElButton class="mb-5" link onClick={lookMore}>
          查看更多
        </ElButton>
      </div>
      <div
        ref={containerProps.ref}
        style={containerProps.style}
        class="h-[90%]"
        onScroll={containerProps.onScroll}
      >
        <div {...wrapperProps.value}>
          {list.value.map((item, index) => (
            <ElCard key={item.data.id} class="mb-5">
              {{
                header: () => (
                  <div class="flex justify-between">
                    <span>{item.data.createTime}</span>
                    <ElButton link onClick={() => delLog(item.data.id)}>
                      <IconCloseFill />
                    </ElButton>
                  </div>
                ),
                default: () => <div>{item.data.message}</div>
              }}
            </ElCard>
          ))}
        </div>
      </div>
    </ElDrawer>
  )

  const NotificationController = () => (
    <Fragment>
      <ElButton link onClick={() => (notificationDrawerVisible.value = true)}>
        <ElBadge
          value={notifications.value.length}
          hidden={notifications.value.length === 0}
          isDot={true}
        >
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
