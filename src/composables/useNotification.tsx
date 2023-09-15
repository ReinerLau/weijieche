import { ElBadge, ElButton, ElCard, ElDrawer } from 'element-plus'
import { reactive, ref } from 'vue'
import IconMdiBellOutline from '~icons/mdi/bell-outline'
import IconCloseFill from '~icons/mingcute/close-fill'
interface websocketData {
  id: string
  type: string
  message: string
  time?: string
}
export const useNotification = () => {
  const notificationDrawerVisible = ref(false)
  const notifications: websocketData[] = reactive([
    {
      id: '1',
      type: 'warning',
      message: 'test',
      time: '2023-09-13'
    }
  ])

  const NotificationDrawer = () => (
    <ElDrawer
      title="通知"
      class="select-none"
      v-model={notificationDrawerVisible.value}
      direction="rtl"
      size="80%"
    >
      {notifications.map((item) => (
        <ElCard>
          {{
            header: () => (
              <div class="flex justify-between">
                <span>{item.time}</span>
                <IconCloseFill class="cursor-pointer" />
              </div>
            ),
            default: () => <div>{item.message}</div>
          }}
        </ElCard>
      ))}
    </ElDrawer>
  )

  const NotificationController = () => (
    <ElButton link onClick={() => (notificationDrawerVisible.value = true)}>
      <ElBadge value={notifications.length} hidden={notifications.length === 0} isDot={true}>
        <IconMdiBellOutline />
      </ElBadge>
    </ElButton>
  )
  return {
    NotificationDrawer,
    NotificationController
  }
}
