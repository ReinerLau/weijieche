import { Mode, Type, fetchNotProcessAlarm, fetchTimeoutAlarm, postAlarmHandling } from '@/api'
import TemplateAlarmDialog from '@/components/TemplateAlarmDialog.vue'
import { currentCar, haveCurrentCar } from '@/shared'
import { alarmDialogVisible, alarmMarkerLayer } from '@/shared/map/alarm'
import { i18n, initWebSocket } from '@/utils'
import { useVirtualList } from '@vueuse/core'
import type { TabPaneName } from 'element-plus'
import {
  ElButton,
  ElCard,
  ElDrawer,
  ElImageViewer,
  ElMessage,
  ElNotification,
  ElTabPane,
  ElTabs,
  ElTooltip
} from 'element-plus'
import { Marker } from 'maptalks'
import type { Ref } from 'vue'
import { Fragment, h, onBeforeUnmount, onMounted, ref, resolveComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import IconMdiBellOutline from '~icons/mdi/bell-outline'

export interface websocketData {
  id?: string
  type?: string
  message?: string
  code?: string
  longitude?: number
  latitude?: number
  heading?: number
  createTime?: string
  picPath?: string
  opencvRecordId?: number
  errorType?: number
}

const notProcessData = ref<{
  createTime?: string
  picPath?: string
  code?: string
  id?: number
} | null>(null)

const getNotProcessAlarm = async () => {
  const res = await fetchNotProcessAlarm()
  notProcessData.value = res.data
}

const messageBox = ref<any>(null)

export const handleAlarmAction = async (data: websocketData, mode: Mode) => {
  let type
  if (data.message === '人员入侵') {
    type = Type.PERSON
  } else if (data.message === '铁丝网破孔') {
    type = Type.HOLE
  } else if (data.message === '无人值班') {
    type = Type.SALUTE
  }

  await postAlarmHandling({ code: data.code, mode, type, opencvRecordId: data.opencvRecordId })
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

  const wsData = ref<websocketData>({
    picPath: '',
    message: '',
    code: '',
    type: '',
    errorType: 0
  })

  // 从 websocket 收到数据后
  function onMessage(e: any) {
    if (e.data !== 'heartbeat') {
      console.log(e.data)

      const data: websocketData = JSON.parse(e.data)
      const { message, longitude, latitude, heading, errorType } = data
      const btn = resolveComponent('el-button')
      console.log(errorType)

      if (errorType === 2) {
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
                    handleAlarmAction(data, Mode.PROCESS)
                  }
                },
                t('shou-dong-chu-li')
              ),
              h(
                btn,
                {
                  style: 'color: #409EFF;cursor: pointer;width: 6rem',
                  onClick: () => {
                    handleAlarmAction(data, Mode.NOT_PROCESS)
                  }
                },
                t('bu-zuo-chu-li')
              )
            ])
          ])
        })
      } else {
        messageBox.value = ElNotification({
          type: 'warning',
          title: t('jing-bao'),
          dangerouslyUseHTMLString: true,
          duration: 300000,
          onClose: () => {},
          message: h('div', [
            h('div', { style: 'display: flex; justify-content: space-between;' }, [
              h('p', {}, message)
            ])
          ])
        })
      }

      if (alarmRef.value && longitude && latitude) {
        alarmRef.value.play()
        // 声音设置
        alarmRef.value.volume = 1
        //警报闪烁
        handleAlarmEvent(longitude, latitude, heading!)
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
      if (currentTab.value === TabNames.FIRST) {
        getTimeoutAlarm()
      } else if (currentTab.value === TabNames.SECOND) {
        getNotProcessAlarm()
      }
    }
  })

  const getTimeoutAlarm = async () => {
    const res = await fetchTimeoutAlarm({ page: 1, limit: 99999 })
    notifications.value = res.data.list
  }

  const previewSrcList = ref<string[]>([])

  const showPreviewImage = ref(false)

  const previewImage = (url: string) => {
    showPreviewImage.value = true
    previewSrcList.value = [url]
  }

  const TabNames = {
    FIRST: 'first',
    SECOND: 'second'
  }

  const currentTab = ref(TabNames.FIRST)

  const handleTabChange = (name: TabPaneName) => {
    if (name === TabNames.FIRST) {
      getTimeoutAlarm()
    } else if (name === TabNames.SECOND) {
      getNotProcessAlarm()
    }
  }

  const activeNoProcessAlarm = async () => {
    if (haveCurrentCar()) {
      await postAlarmHandling({
        code: currentCar.value,
        mode: Mode.ACTIVE,
        type: 1,
        opencvRecordId: notProcessData.value?.id
      })
      getNotProcessAlarm()
    }
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
      <ElTabs v-model={currentTab.value} onTabChange={handleTabChange}>
        <ElTabPane label={t('chao-shi-wei-chu-li')} name={TabNames.FIRST}></ElTabPane>
        <ElTabPane label={t('bu-chu-li')} name={TabNames.SECOND}></ElTabPane>
      </ElTabs>
      {currentTab.value === TabNames.FIRST && (
        <div
          ref={containerProps.ref}
          style={containerProps.style}
          class="h-[85%]"
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
      )}
      {currentTab.value === TabNames.SECOND && notProcessData.value && (
        <ElCard>
          {{
            header: () => (
              <div class="flex justify-between">
                <span>{notProcessData.value!.code}</span>
                <span>{notProcessData.value!.createTime}</span>
              </div>
            ),
            default: () => (
              <div class="flex justify-between">
                <div>{t('ren-yuan-ru-qin')}</div>
                <div>
                  <ElButton link onClick={() => previewImage(notProcessData.value!.picPath!)}>
                    {t('cha-kan-tu-pian')}
                  </ElButton>
                  <ElButton type="primary" link onClick={activeNoProcessAlarm}>
                    {t('ji-huo')}
                  </ElButton>
                </div>
              </div>
            )
          }}
        </ElCard>
      )}
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
