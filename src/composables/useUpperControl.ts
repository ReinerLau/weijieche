import { initWebSocket } from '@/utils'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
export const musicMessage: Ref<Record<string, any>> = ref({})
export const musicList: any = ref([])
export const birStatus = ref('')
export const lightStatus = ref('')
export const useUpperControl = () => {
  // 国际化
  const { t } = useI18n()

  // 标记是否已经连接 websocket
  const isConnectedWS = ref(false)

  const isOpenFeedback = ref(false)
  let ws: WebSocket | undefined

  //断开重连定时器
  let reconnectInterval: number | NodeJS.Timer | null = null

  // 监听到选择车辆后连接 websocket
  watch(isOpenFeedback, () => {
    if (isOpenFeedback.value) {
      tryCloseWS()
      connectWebSocket()
    }
  })

  // 关闭页面前先关闭 websocket
  onBeforeUnmount(tryCloseWS)

  // 关闭 websocket
  function tryCloseWS() {
    if (ws) {
      ws.close()
      ws = undefined
    }
    clearReconnectInterval()
  }

  // 清除重连定时器
  function clearReconnectInterval() {
    if (reconnectInterval) {
      clearInterval(reconnectInterval)
      reconnectInterval = null
    }
  }

  // 连接 WebSocket
  function connectWebSocket() {
    ws = initWebSocket('/websocket/patroling/feedback', {
      onmessage: (event: MessageEvent<any>) => {
        const data = JSON.parse(event.data)
        if (data.type === 4) {
          if (data.code === 'ADAS') {
            musicMessage.value = data.message
          } else if (data.code === 'ADAG') {
            console.log(musicList.value)

            musicList.value = data.message
          } else {
            musicMessage.value = {
              volumeValue: '',
              index: '',
              mode: '',
              name: '',
              status: ''
            }
            musicList.value.length = 0
          }
        } else if (data.type === 6) {
          birStatus.value = data.message
        } else if (data.type === 7) {
          lightStatus.value = data.message
        }
      },

      onopen: () => {
        isConnectedWS.value = true
        ElMessage({
          type: 'success',
          message: t('jian-ting-zhuang-tai-lian-jie-cheng-gong')
        })
        clearReconnectInterval()
      },
      onclose: () => {
        isConnectedWS.value = false
        ElMessage({
          type: 'warning',
          message: t('jian-ting-zhuang-tai-lian-jie-duan-kai')
        })
        // 断开后每隔一段时间重新连接
        startReconnectInterval()
      },
      onerror: () => {
        isConnectedWS.value = false
        ElMessage({
          type: 'warning',
          message: t('jian-ting-zhuang-tai-lian-jie-cuo-wu')
        })
        // 出错后每隔一段时间重新连接
        startReconnectInterval()
      }
    })
  }

  // 开始重连定时器
  function startReconnectInterval() {
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        tryCloseWS()
        ElMessage({
          type: 'warning',
          message: t('websocket-duan-kai-zhong-lian-zhong')
        })
        connectWebSocket()
      }, 5000) // 每隔5秒重新连接
    }
  }

  return {
    isOpenFeedback
  }
}
