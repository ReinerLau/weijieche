import { i18n, initWebSocket } from '@/utils'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

let ws: WebSocket | undefined
let reconnectInterval: number | NodeJS.Timer | null = null
const isConnectedWS = ref(false)
const NewCurrentCarStatus = ref('🚫')
const NewCurrentCarBattery = ref()
const NewCurrentCarSpeed = ref()

const tryCloseWS = () => {
  if (ws) {
    ws.close()
    ws = undefined
  }
  clearReconnectInterval()
}

const clearReconnectInterval = () => {
  if (reconnectInterval) {
    clearInterval(reconnectInterval)
    reconnectInterval = null
  }
}

const connectWebSocket = () => {
  ws = initWebSocket('/websocket/patroling/status', {
    onmessage: (event: MessageEvent<any>) => {
      if (event.data !== 'heartbeat') {
        const data = JSON.parse(event.data)
        const status = data.status
        const battery = data.battery
        const speed = data.currentSpeed
        NewCurrentCarStatus.value = status === 1 ? '✅' : '🚫'
        NewCurrentCarBattery.value = battery
        NewCurrentCarSpeed.value = speed
      }
    },
    onopen: () => {
      isConnectedWS.value = true
      ElMessage({
        type: 'success',
        message: i18n.global.t('jian-ting-zhuang-tai-lian-jie-cheng-gong')
      })
      clearReconnectInterval()
    },
    onclose: () => {
      isConnectedWS.value = false
      ElMessage({
        type: 'warning',
        message: i18n.global.t('jian-ting-zhuang-tai-lian-jie-duan-kai')
      })
      // 断开后每隔一段时间重新连接
      startReconnectInterval()
    },
    onerror: () => {
      isConnectedWS.value = false
      ElMessage({
        type: 'warning',
        message: i18n.global.t('jian-ting-zhuang-tai-lian-jie-cuo-wu')
      })
      // 出错后每隔一段时间重新连接
      startReconnectInterval()
    }
  })
}

const startReconnectInterval = () => {
  if (!reconnectInterval) {
    reconnectInterval = setInterval(() => {
      tryCloseWS()
      ElMessage({
        type: 'warning',
        message: i18n.global.t('websocket-duan-kai-zhong-lian-zhong')
      })
      connectWebSocket()
    }, 5000) // 每隔5秒重新连接
  }
}

export const carStatus = {
  tryCloseWS,
  connectWebSocket,
  NewCurrentCarStatus,
  NewCurrentCarBattery,
  NewCurrentCarSpeed
}
