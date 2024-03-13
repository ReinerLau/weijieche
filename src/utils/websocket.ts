import { getToken } from './token'

// 连接 websocket
export function initWebSocket(
  url: string,
  {
    onmessage,
    onopen,
    onclose,
    onerror
  }: {
    onmessage: (e: MessageEvent<any>) => void
    onopen?: () => void
    onclose?: () => void
    onerror?: () => void
  }
) {
  const token = getToken()
  const websocket = new WebSocket(`ws://${window.location.host}${url}`, [token!])
  websocket.onmessage = onmessage
  websocket.onopen = onopen || null
  websocket.onclose = onclose || null
  websocket.onerror = onerror || null
  return websocket
}
