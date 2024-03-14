import { onBeforeUnmount, ref, watch } from 'vue'
import { currentCar } from '@/shared'
import { initWebSocket } from '@/utils'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export const useCarStatus = (status: any, battery: any) => {
  // 国际化
  const { t } = useI18n()

  const NewCurrentCarStatus = ref(status)

  //电量
  const NewCurrentCarBattery = ref(battery)
  // 标记是否已经连接 websocket
  const isConnectedWS = ref(false)

  let ws: WebSocket | undefined

  //断开重连定时器
  let reconnectInterval: number | NodeJS.Timer | null = null

  // 监听到选择车辆后连接 websocket
  watch(currentCar, () => {
    tryCloseWS()
    connectWebSocket()
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
    ws = initWebSocket('/websocket/patroling/status', {
      onmessage: (event: MessageEvent<any>) => {
        const data = JSON.parse(event.data)
        const status = data.status
        const battery = data.battery
        console.log(data)

        // 更新currentCarStatus NewCurrentCarBattery的值
        NewCurrentCarStatus.value = status === 1 ? '✅' : '🚫'
        NewCurrentCarBattery.value = battery
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
    NewCurrentCarStatus,
    NewCurrentCarBattery
  }
}
