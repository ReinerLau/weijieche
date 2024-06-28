import { patrolingRemote } from '@/api/control'
import { controllerTypes, currentController, currentControllerType, pressedButtons } from '@/shared'
import { useGamepad } from '@vueuse/core'
import {
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElMessage,
  ElOption,
  ElScrollbar,
  ElSelect
} from 'element-plus'
import type { Ref } from 'vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomButtons, TopButtons, useConsoleButton } from './consoleButtons'
import { useDisperse } from './disperse'
import { useLight } from './light'
import { useBirdAway } from './useBirdAway'
import { carMode, useControlSection } from './useControlSection'
import { usePantilt } from './usePantilt'

// 手柄、方向盘相关逻辑
export const useController = (currentCar: any) => {
  const { t } = useI18n()
  const { onButtonDown: onBottomButtonDown } = useConsoleButton()
  const { onButtonDown: onTopButtonDown } = useConsoleButton()
  const { openFloodingLight, toggleAlarmLight } = useLight()
  const { toggleDisperse } = useDisperse()

  // 已连接的控制器
  const controllers: Ref<Gamepad[]> = ref([])

  // 速度
  const speed = ref(0)

  // true：前进，false：后退
  const gear = ref(true)

  // 手柄映射
  const gamepadMap = reactive({
    SPEED: 0,
    DIRECTION: 0
  })

  // 方向盘映射
  const wheelMap = reactive({
    SPEED: 0,
    DIRECTION: 0
  })

  // 方向
  const direction = ref(0)

  // 保存和获取控制器映射需要用到
  const stroageKeys = {
    GAMEPAD: 'gamepad-key-map',
    WHEEL: 'wheel-key-map'
  }

  // 尝试从本地存储中获取上一次设置好的控制器映射
  function initControllerMap() {
    // 获取手柄映射
    let res: any = JSON.parse(localStorage.getItem(stroageKeys.GAMEPAD) || '{}')
    gamepadMap.SPEED = res.SPEED || 0
    gamepadMap.DIRECTION = res.DIRECTION || 0

    // 获取方向盘映射
    res = JSON.parse(localStorage.getItem(stroageKeys.WHEEL) || '{}')
    wheelMap.SPEED = res.SPEED || 0
    wheelMap.DIRECTION = res.DIRECTION || 0
  }

  // 用于随时取消对控制器操作的监听
  let rAF: number

  // 实时监听控制器操作
  function onControllerOperation() {
    // 获取所有已连接的控制器
    const { gamepads } = useGamepad()
    controllers.value = gamepads.value as any

    // 匹配当前选择的控制器
    if (currentController.value && currentControllerType.value) {
      const controller = gamepads.value.find((item) => item.id === currentController.value)
      if (controller) {
        // 控制器摇杆信息
        const axes = controller?.axes

        // 控制器按键信息
        const buttons = controller?.buttons

        axeMap.value = axes
        speed.value = setSpeed(axes)

        direction.value = setDirection(axes)
        pressedButtons.value = setButtons(buttons)
      }
    }

    // 大概每 16ms 执行一次
    rAF = requestAnimationFrame(onControllerOperation)
  }

  // 获取按过的按键
  function setButtons(buttons: ReadonlyArray<GamepadButton>) {
    return buttons.findIndex((item) => item.pressed)
  }

  // 获取速度
  function setSpeed(axes: ReadonlyArray<number>): number {
    let newSpeed = speed.value
    let gas = 0
    if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      // 如果当前选择的控制器类型是手柄
      gas = parseFloat(axes[gamepadMap.SPEED].toFixed(1))
      newSpeed = Math.abs(gas) * 1000
    } else if (currentControllerType.value === controllerTypes.value.WHEEL) {
      // 如果当前选择的控制器类型是方向盘
      gas = parseFloat(axes[wheelMap.SPEED].toFixed(1))
      newSpeed = parseFloat((Math.abs(gas - 1) / 2).toFixed(1)) * 1000
    }

    return gear.value ? newSpeed : -newSpeed
  }

  function getJoyStickValue(value1: number, value2: number) {
    // 十进制向左移动 8 位并进行逻辑与操作
    let result = (value1 << 8) | value2
    result = parseFloat(((result - 2048) / 4095).toFixed(1)) * 2000
    return result
  }

  // 获取转向
  function setDirection(axes: ReadonlyArray<number>): number {
    let newDirection = 0

    let wheel = 0

    if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      // 如果当前选择的控制器类型是手柄
      wheel = parseFloat(axes[gamepadMap.DIRECTION].toFixed(1))
    } else if (currentControllerType.value === controllerTypes.value.WHEEL) {
      // 如果当前选择的控制器类型是方向盘
      wheel = parseFloat(axes[wheelMap.DIRECTION].toFixed(1))
    }
    newDirection = wheel * 1000

    return newDirection
  }

  // 控制器映射设置弹窗是否可视
  const controllerMapDialogVisible = ref(false)

  // 摇杆映射
  const axeMap: Ref<readonly number[]> = ref([])

  // 每次修改手柄映射都保存起来
  watch(gamepadMap, (val) => {
    localStorage.setItem(stroageKeys.GAMEPAD, JSON.stringify(val))
  })

  // 每次修改方向盘映射都保存起来
  watch(wheelMap, (val) => {
    localStorage.setItem(stroageKeys.WHEEL, JSON.stringify(val))
  })

  let st: any = null
  let seq = 0

  function submitData() {
    const data = { x: speed.value, y: direction.value, seq }

    patrolingRemote(currentCar.value, data).then(() => {
      seq++
      if (seq > 254) {
        seq = 0
      }
      // 按住按钮的情况
      if (speed.value !== 0 || direction.value !== 0) {
        st = setTimeout(submitData, 200)
      }
    })
  }

  watch([speed, direction], () => {
    if (carMode.value === modeKey.MANUAL) {
      clearTimeout(st)
      submitData()
    } else {
      return
    }
  })

  const { setMode, modeKey } = useControlSection()
  const { onClickBirdAway } = useBirdAway()
  const { onClickPantilt, PantiltMode, pantiltX, pantiltY } = usePantilt()

  const BottomButtonActionMap = new Map<BottomButtons, (status: number) => void>([
    [BottomButtons.MANUAL, (status: number) => status && setMode(modeKey.MANUAL)],
    [BottomButtons.STRONG_LIGHT, (status: number) => status && openFloodingLight()],
    [BottomButtons.AMPLIFIER_OPEN, (status: number) => toggleDisperse(status ? true : false)],
    [BottomButtons.AMPLIFIER_CLOSE, (status: number) => toggleAlarmLight(status ? true : false)],
    [BottomButtons.VOICE, (status: number) => status && onClickBirdAway(7)],
    [BottomButtons.END_AUDIO, (status: number) => status && onClickBirdAway(8)],
    [BottomButtons.AUTO, (status: number) => status && setMode(modeKey.AUTO)],
    [
      BottomButtons.PANTILT_RESET,
      (status: number) => status && onClickPantilt(PantiltMode.RECALL, 255)
    ]
  ])

  const TopButtonActionMap = new Map<TopButtons, (status: number) => void>([
    [TopButtons.AUDIO_1, (status: number) => status && onClickBirdAway(9)],
    [TopButtons.AUDIO_2, (status: number) => status && onClickBirdAway(10)]
  ])

  // 设置映射的弹窗组件
  const ControllerMapDialog = () => (
    <ElDialog
      v-model={controllerMapDialogVisible.value}
      title={t('kong-zhi-qi-ying-she')}
      width="50vw"
      align-center
    >
      {{
        default: () => (
          <ElScrollbar>
            <ElDescriptions border={true} direction="vertical">
              <ElDescriptionsItem label={t('yao-gan')}>
                {axeMap.value.map((axe, index) => (
                  <div>
                    {index}：{axe}
                  </div>
                ))}
              </ElDescriptionsItem>
            </ElDescriptions>
            <ElDescriptions border={true} direction="vertical">
              <ElDescriptionsItem label={t('shou-bing')}>
                <div>
                  <div>{t('su-du')}</div>
                  <ElSelect class="w-full" v-model={gamepadMap.SPEED}>
                    {axeMap.value.map((axe, index) => (
                      <ElOption key={index} value={index} label={index}></ElOption>
                    ))}
                  </ElSelect>
                </div>
                <div>
                  <div>{t('zhuan-xiang')}</div>
                  <ElSelect class="w-full" v-model={gamepadMap.DIRECTION}>
                    {axeMap.value.map((axe, index) => (
                      <ElOption key={index} value={index} label={index}></ElOption>
                    ))}
                  </ElSelect>
                </div>
              </ElDescriptionsItem>
              <ElDescriptionsItem label={t('fang-xiang-pan')}>
                <div>
                  <div>{t('su-du')}</div>
                  <ElSelect class="w-full" v-model={wheelMap.SPEED}>
                    {axeMap.value.map((axe, index) => (
                      <ElOption key={index} value={index} label={index}></ElOption>
                    ))}
                  </ElSelect>
                </div>
                <div>
                  <div>{t('zhuan-xiang')}</div>
                  <ElSelect class="w-full" v-model={wheelMap.DIRECTION}>
                    {axeMap.value.map((axe, index) => (
                      <ElOption key={index} value={index} label={index}></ElOption>
                    ))}
                  </ElSelect>
                </div>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElScrollbar>
        )
      }}
    </ElDialog>
  )

  async function connectControlPan() {
    const port = await navigator.serial.requestPort()
    let ref: number
    port.ondisconnect = () => {
      port.close()
      cancelAnimationFrame(ref)
    }

    const serialOptions: SerialOptions = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      bufferSize: 1024,
      flowControl: 'none'
    }
    try {
      await port.open(serialOptions)
      ElMessage.success('连接成功')
      const onPort = async () => {
        if (port.readable) {
          const reader = port.readable.getReader()
          try {
            const { value, done } = await reader.read()
            if (!done) {
              if (value.length === 19) {
                // console.clear()
                // console.log(value)
                // 只有按住油门摇杆上方红色才能修改速度
                if (value[15] === 32) {
                  speed.value = getJoyStickValue(value[12], value[13])
                } else {
                  speed.value = 0
                }
                direction.value = getJoyStickValue(value[2], value[3])
                onBottomButton(value[16])
                onTopButton(value[17])
                pantiltX.value = (value[6] << 8) | value[7]
                pantiltY.value = (value[8] << 8) | value[9]
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
        ref = requestAnimationFrame(onPort)
      }
      onPort()
    } catch {
      ElMessage.error('检测到已连接')
    }
  }

  const onBottomButton = (value: number) => {
    const bottomButton = onBottomButtonDown(value)
    if (bottomButton) {
      const actionGetter = BottomButtonActionMap.get(bottomButton.index)
      actionGetter && actionGetter(bottomButton.buttonStatus)
    }
  }

  const onTopButton = (value: number) => {
    const pressedButton = onTopButtonDown(value)
    if (pressedButton) {
      const actionGetter = TopButtonActionMap.get(pressedButton.index)
      actionGetter && actionGetter(pressedButton.buttonStatus)
    }
  }

  onMounted(() => {
    onControllerOperation()

    initControllerMap()

    const { onConnected, onDisconnected } = useGamepad()

    // 监听到控制器连接后开始监听
    onConnected(onControllerOperation)

    // 监听到控制器断连后取消监听
    onDisconnected(() => {
      cancelAnimationFrame(rAF)
      currentController.value = ''
      currentControllerType.value = ''
    })
  })

  return {
    controllers,
    controllerTypes,
    speed,
    gear,
    ControllerMapDialog,
    controllerMapDialogVisible,
    direction,
    connectControlPan
  }
}
