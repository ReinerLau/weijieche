import { initWebSocket } from '@/utils'
import {
  ElButton,
  ElCard,
  ElDrawer,
  ElImageViewer,
  ElMessage,
  ElNotification,
  ElTooltip
} from 'element-plus'
import { Fragment, h, onBeforeUnmount, onMounted, ref, resolveComponent, watch } from 'vue'
import IconMdiBellOutline from '~icons/mdi/bell-outline'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchTimeoutAlarm, getHandleAlarm } from '@/api'
import { useVirtualList } from '@vueuse/core'
import { Marker } from 'maptalks'
import { alarmDialogVisible, alarmMarkerLayer } from '@/shared/map/alarm'
import TemplateAlarmDialog from '@/components/TemplateAlarmDialog.vue'
import { i18n } from '@/utils'

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

const messageBox = ref<any>(null)

//处理警报相关逻辑
export const handleAlarmAction = async (data: any, mode: number) => {
  let type = null
  const messageToType: {
    [key: string]: number
    人员入侵: number
    铁丝网识别: number
    敬礼识别: number
  } = {
    人员入侵: 1,
    铁丝网识别: 2,
    敬礼识别: 3
  }
  type = messageToType[data.message]
  await getHandleAlarm(data.code, type, mode)
  ElMessage({ type: 'success', message: i18n.global.t('cao-zuo-cheng-gong') })
  messageBox.value.close()
  alarmDialogVisible.value = false
}

// 警报通知相关
export const useNotification = () => {
  // 通知列表抽屉是否可见
  const notificationDrawerVisible = ref(false)

  // 通知列表数据
  const notifications: Ref<any[]> = ref([])

  // 国际化
  const { t } = useI18n()

  // 警报音频 dom 元素
  const alarmRef: Ref<HTMLMediaElement | undefined> = ref()

  const wsData = ref({
    picPath: '',
    message: '',
    code: '',
    type: ''
  })

  // 从 websocket 收到数据后
  function onMessage(e: any) {
    if (e.data !== 'heartbeat') {
      const data: websocketData = JSON.parse(e.data)
      const { message, longitude, latitude, heading } = data
      const btn = resolveComponent('el-button')
      messageBox.value = ElNotification({
        type: 'warning',
        title: t('jing-bao'),
        dangerouslyUseHTMLString: true,
        duration: 300000,
        onClose: () => {},
        message: h('div', [
          h('div', { style: 'display: flex; justify-content: space-between;' }, [
            h('p', {}, message),
            h(
              btn,
              {
                style: 'color: #A0A0A0;cursor: pointer;',
                onClick: () => {
                  handleAlarmAll(data)
                }
              },
              t('cha-kan-jing-bao-xiang-qing')
            )
          ]),
          h('div', { style: 'display: flex; justify-content: space-around;' }, [
            h(
              btn,
              {
                style: 'color: #ff931e;cursor: pointer;width: 6rem',
                onClick: () => {
                  handleAlarmAction(data, 1)
                }
              },
              t('shou-dong-chu-li')
            ),
            h(
              btn,
              {
                style: 'color: #409EFF;cursor: pointer;width: 6rem',
                onClick: () => {
                  handleAlarmAction(data, 0)
                }
              },
              t('bu-zuo-chu-li')
            )
          ])
        ])
      })

      if (alarmRef.value && longitude && latitude) {
        alarmRef.value.play()
        // 声音设置
        alarmRef.value.volume = 1
        //警报闪烁
        handleAlarmEvent(longitude, latitude, heading)
      }
    }
  }

  function handleAlarmAll(data: any) {
    alarmDialogVisible.value = true
    wsData.value = data
  }

  //每次收到警报定位车辆
  function handleAlarmEvent(longitude: number, latitude: number, heading: number) {
    alarmMarkerLayer.clear()
    if (longitude && latitude) {
      const point = new Marker([longitude as number, latitude as number], {
        symbol: {
          markerType: 'triangle',
          markerFill: '#FF00F3',
          markerWidth: 14,
          markerHeight: 16,
          markerRotation: -Number(heading)
        }
      })
      alarmMarkerLayer.addGeometry(point)
      point.flash(200, 12)
    }
  }
  // websocket 实例
  let websocket: WebSocket | undefined
  // 是否显示 websocket 已断开的提示
  const isOpen = ref(false)

  onMounted(() => {
    if (alarmRef.value) {
      alarmRef.value.load() // 预加载音频
    }
    websocket = initWebSocket('/websocket', {
      onmessage: onMessage,
      onopen: () => {
        isOpen.value = true
        ElMessage({
          type: 'success',
          message: t('jian-ting-jing-bao-lian-jie-cheng-gong')
        })
      },
      onclose: () => {
        isOpen.value = false
        ElMessage({
          type: 'warning',
          message: t('jian-ting-jing-bao-lian-jie-duan-kai')
        })
      },
      onerror: () => {
        isOpen.value = false
        ElMessage({
          type: 'error',
          message: t('jian-ting-jing-bao-lian-jie-cuo-wu')
        })
      }
    })
  })
  // 关闭页面同时关闭 websocket
  onBeforeUnmount(() => {
    websocket?.close()
  })

  // 虚拟滚动相关，防止数据过多滚动卡顿
  // https://vueuse.org/core/useVirtualList/#usevirtuallist
  const { list, containerProps, wrapperProps } = useVirtualList(notifications, {
    itemHeight: 125
  })

  watch(notificationDrawerVisible, async (newVal: boolean) => {
    if (newVal) {
      const res = await fetchTimeoutAlarm({ page: 1, limit: 99999 })
      notifications.value = res.data.list
    }
  })

  const previewSrcList = ref<string[]>([])

  const showPreviewImage = ref(false)

  const previewImage = (url: string) => {
    showPreviewImage.value = true
    previewSrcList.value = [url]
  }

  // 警报抽屉组件
  const NotificationDrawer = () => (
    <ElDrawer
      title={t('gao-jing')}
      class="select-none"
      v-model={notificationDrawerVisible.value}
      direction="rtl"
      size="30%"
    >
      <div
        ref={containerProps.ref}
        style={containerProps.style}
        class="h-[95%]"
        onScroll={containerProps.onScroll}
      >
        <div {...wrapperProps.value}>
          {list.value.map((item) => (
            <ElCard key={item.data.id} class="mb-5">
              {{
                header: () => (
                  <div class="flex justify-between">
                    <span>{item.data.code}</span>
                    <span>{item.data.createTime}</span>
                  </div>
                ),
                default: () => (
                  <div class="flex justify-between">
                    <div>{item.data.type}</div>
                    <ElButton link onClick={() => previewImage(item.data.picPath)}>
                      {t('cha-kan-tu-pian')}
                    </ElButton>
                  </div>
                )
              }}
            </ElCard>
          ))}
        </div>
      </div>
      {showPreviewImage.value && (
        <ElImageViewer
          onClose={() => (showPreviewImage.value = false)}
          urlList={previewSrcList.value}
        ></ElImageViewer>
      )}
    </ElDrawer>
  )

  // 控制警报抽屉组件
  const NotificationController = () => (
    <Fragment>
      <ElTooltip content={t('tong-zhi')}>
        <ElButton link onClick={() => (notificationDrawerVisible.value = true)} class="ml-3">
          <IconMdiBellOutline />
        </ElButton>
      </ElTooltip>

      <audio ref={alarmRef} src="/unionAlarm.wav" hidden></audio>
      <TemplateAlarmDialog wsdata={wsData.value} />
    </Fragment>
  )

  return {
    NotificationDrawer,
    NotificationController
  }
}
