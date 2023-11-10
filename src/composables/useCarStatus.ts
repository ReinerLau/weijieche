import { onBeforeUnmount, ref, watch } from 'vue'
import { currentCar } from '@/shared'
import { initWebSocket } from '@/utils'

export const useCarStatus = (status: any) => {
  const NewCurrentCarStatus = ref(status)
  // 标记是否已经连接 websocket
  const isConnectedWS = ref(false)
  let ws: WebSocket | undefined

  // 监听到选择车辆后连接 websocket
  watch(currentCar, () => {
    tryCloseWS()
    ws = initWebSocket('/websocket/patroling/status', {
      onmessage: (event: MessageEvent<any>) => {
        const data = JSON.parse(event.data)
        const status = data.status
        // 更新currentCarStatus的值
        NewCurrentCarStatus.value = status === 1 ? '✅' : '🚫'
      },
      onopen: () => {
        isConnectedWS.value = true
      },
      onclose: () => {
        isConnectedWS.value = false
      },
      onerror: () => {
        isConnectedWS.value = false
      }
    })
  })

  // 关闭页面前先关闭 websocket
  onBeforeUnmount(tryCloseWS)

  // 关闭 websocket
  function tryCloseWS() {
    if (ws) {
      ws.close()
    }
  }
  return {
    NewCurrentCarStatus
  }
}
