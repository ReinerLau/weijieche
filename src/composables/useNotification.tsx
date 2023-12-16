import { getToken } from '@/utils'
import {
  ElAlert,
  ElBadge,
  ElButton,
  ElCard,
  ElDrawer,
  ElMessage,
  ElMessageBox
  // ElNotification
} from 'element-plus'
import { Fragment, onBeforeUnmount, onMounted, ref } from 'vue'
import IconMdiBellOutline from '~icons/mdi/bell-outline'
import IconCloseFill from '~icons/mingcute/close-fill'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteLog, getAllLog } from '@/api'
import { useVirtualList } from '@vueuse/core'
import { useTemplate } from './useTemplate'

// 删除数组元素
// https://lodash.com/docs/4.17.15#remove
import { remove } from 'lodash'
import { Marker, VectorLayer, Map } from 'maptalks'

// 收到的 websocket 数据结构类型声明
interface websocketData {
  id: string
  type: string
  message: string
  code: string
  longitude: number
  latitude: number
  heading: number
  createTime?: string
}

// 警报通知相关
export const useNotification = () => {
  // 警报弹窗组件
  const { TemplateAlarmDialog, alarmDialogVisible } = useTemplate()

  //异常警报图层
  let alarmMarkerLayer: VectorLayer

  // 通知列表抽屉是否可见
  const notificationDrawerVisible = ref(false)

  // 通知列表数据
  const notifications: Ref<websocketData[]> = ref([])

  // 国际化
  const { t } = useI18n()

  // 连接 websocket
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

  // 警报音频 dom 元素
  const alarmRef: Ref<HTMLMediaElement | undefined> = ref()

  // 从 websocket 收到数据后
  function onMessage(e: any) {
    // alarmMarkerLayer.clear()
    const data: websocketData = JSON.parse(e.data)
    const { type, message, code, longitude, latitude } = data
    // ElNotification({
    //   type: type as 'warning' | 'error',
    //   message: code + ':' + message,
    //   position: 'bottom-right'
    // })
    const messageBox = ref<any>(null)

    messageBox.value = ElMessageBox({
      title: '警告',
      message: code + ': ' + message,
      type: type as 'warning' | 'error',
      customClass: 'notification-message-box',
      showCancelButton: true,
      cancelButtonText: '关闭',
      confirmButtonText: '处理',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          // 点击处理按钮时的逻辑
          alarmDialogVisible.value = true
        } else if (action === 'cancel') {
          // 点击关闭按钮时的逻辑
          console.log('关闭')
        }
        done()
      }
    })
    if (alarmRef.value) {
      alarmRef.value.play()
      // 声音设置
      alarmRef.value.volume = 1
      // handleAlarmEvent(longitude, latitude)
    }

    notifications.value.push(data)
  }

  function initAlarmLayer(map: Map) {
    alarmMarkerLayer = new VectorLayer('alarm-marker')
    alarmMarkerLayer.addTo(map)
  }

  //警报
  // function handleAlarmEvent(longitude: number, latitude: number) {
  //   if (longitude && latitude) {
  //     const point = new Marker([longitude as number, latitude as number], {
  //       symbol: {
  //         markerType: 'triangle',
  //         markerFill: 'red',
  //         markerWidth: 15,
  //         markerHeight: 20,
  //         markerRotation: 0
  //       }
  //     })
  //     alarmMarkerLayer.addGeometry(point)
  //     point.flash(200, 12)
  //   }
  // }

  // websocket 实例
  let websocket: WebSocket | undefined
  // 是否显示 websocket 已断开的提示
  const isOpen = ref(false)

  onMounted(() => {
    websocket = initWebsocket()
  })

  // 关闭页面同时关闭 websocket
  onBeforeUnmount(() => {
    websocket?.close()
  })

  // 虚拟滚动相关，防止数据过多滚动卡顿
  // https://vueuse.org/core/useVirtualList/#usevirtuallist
  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(notifications, {
    itemHeight: 125
  })

  // 查看警报历史数据
  async function lookMore() {
    const res = await getAllLog()
    notifications.value = res.data || []
    scrollTo(0)
  }

  // 删除警报数据
  async function delLog(id: string) {
    const res: any = await deleteLog(id)
    ElMessage({
      type: 'success',
      message: res.message
    })
    getAllLog()
    remove(list.value, (item) => item.data.id === id)
  }

  // 警报抽屉组件
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

  // 控制警报抽屉组件
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
      <TemplateAlarmDialog />
    </Fragment>
  )
  return {
    NotificationDrawer,
    NotificationController,
    initAlarmLayer
  }
}
