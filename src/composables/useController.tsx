import { controllerTypes, currentController, currentControllerType, pressedButtons } from '@/shared'
import { useGamepad } from '@vueuse/core'
import {
  ElDescriptions,
  ElDescriptionsItem,
  ElDialog,
  ElOption,
  ElScrollbar,
  ElSelect
} from 'element-plus'
import { reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useController = () => {
  const { t } = useI18n()
  const controllers: Ref<Gamepad[]> = ref([])
  const speed = ref(0)
  const gear = ref(true)
  const gamepadMap = reactive({
    SPEED: 0,
    DIRECTION: 0
  })
  const wheelMap = reactive({
    SPEED: 0,
    DIRECTION: 0
  })
  const direction = ref(0)

  const stroageKeys = {
    GAMEPAD: 'gamepad-key-map',
    WHEEL: 'wheel-key-map'
  }

  function initControllerMap() {
    let res: any = JSON.parse(localStorage.getItem(stroageKeys.GAMEPAD) || '{}')
    gamepadMap.SPEED = res.SPEED || 0
    gamepadMap.DIRECTION = res.DIRECTION || 0
    res = JSON.parse(localStorage.getItem(stroageKeys.WHEEL) || '{}')
    wheelMap.SPEED = res.SPEED || 0
    wheelMap.DIRECTION = res.DIRECTION || 0
  }

  let rAF: number

  onControllerOperation()
  initControllerMap()

  const { onConnected, onDisconnected } = useGamepad()

  onConnected(onControllerOperation)
  onDisconnected(() => {
    cancelAnimationFrame(rAF)
    currentController.value = ''
    currentControllerType.value = ''
  })

  function onControllerOperation() {
    const { gamepads } = useGamepad()
    controllers.value = gamepads.value
    if (currentController.value && currentControllerType.value) {
      const controller = gamepads.value.find((item) => item.id === currentController.value)
      if (controller) {
        const axes = controller?.axes
        const buttons = controller?.buttons
        axeMap.value = axes
        speed.value = setSpeed(axes)
        direction.value = setDirection(axes)
        pressedButtons.value = setButtons(buttons)
      }
    }
    rAF = requestAnimationFrame(onControllerOperation)
  }

  function setButtons(buttons: ReadonlyArray<GamepadButton>) {
    return buttons.findIndex((item) => item.pressed)
  }

  function setSpeed(axes: ReadonlyArray<number>): number {
    let newSpeed = speed.value
    let gas = 0
    if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      gas = parseFloat(axes[gamepadMap.SPEED].toFixed(1))
      newSpeed = Math.abs(gas) * 1000
    } else if (currentControllerType.value === controllerTypes.value.WHEEL) {
      gas = parseFloat(axes[wheelMap.SPEED].toFixed(1))
      newSpeed = parseFloat((Math.abs(gas - 1) / 2).toFixed(1)) * 1000
    }
    return gear.value ? newSpeed : -newSpeed
  }

  function setDirection(axes: ReadonlyArray<number>): number {
    let newDirection = 0
    let wheel = 0
    if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      wheel = parseFloat(axes[gamepadMap.DIRECTION].toFixed(1))
    } else if (currentControllerType.value === controllerTypes.value.WHEEL) {
      wheel = parseFloat(axes[wheelMap.DIRECTION].toFixed(1))
    }
    newDirection = wheel * 1000
    return newDirection
  }

  const controllerMapDialogVisible = ref(false)
  const axeMap: Ref<readonly number[]> = ref([])

  watch(gamepadMap, (val) => {
    localStorage.setItem(stroageKeys.GAMEPAD, JSON.stringify(val))
  })
  watch(wheelMap, (val) => {
    localStorage.setItem(stroageKeys.WHEEL, JSON.stringify(val))
  })
  const ControllerMapDialog = () => (
    <ElDialog v-model={controllerMapDialogVisible.value} title={t('kong-zhi-qi-ying-she')}>
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

  return {
    controllers,
    controllerTypes,
    speed,
    gear,
    ControllerMapDialog,
    controllerMapDialogVisible,
    direction
  }
}
