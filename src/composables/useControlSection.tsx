import { patrolingCruise, patrolingSetMode } from '@/api'
import {
  controllerTypes,
  currentCar,
  currentControllerType,
  haveCurrentCar,
  mode,
  pressedButtons
} from '@/shared'
import { ElMessage } from 'element-plus'
import { computed, ref, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
export const carMode = ref('')
// 顶部操控相关

enum modeKey {
  STOP = 'STOP',
  AUTO = 'AUTO',
  MANUAL = 'MANUAL'
}

export const useControlSection = () => {
  // 国际化
  const { t } = useI18n()

  // 近灯是否开启
  const lowLight = ref(false)

  // 远灯是否开启
  const highLight = ref(false)

  // 近远灯映射值
  const lightModes = {
    HIGHBEAM: '01',
    LOWBEAM: '02',
    AUTOBEAM: '03'
  }

  // 切换近远灯相关事件
  function toggleLight(value: boolean, mode: string) {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '07',
        param2: value ? mode : '00',
        param3: 255,
        param4: 255
      }
      patrolingCruise(data)
    }
  }

  async function setMode(type: keyof typeof mode) {
    carMode.value = ''
    if (haveCurrentCar()) {
      await patrolingSetMode(currentCar.value, mode[type])
      ElMessage({ type: 'success', message: t('qie-huan-cheng-gong') })
      carMode.value = type
    }
  }

  // 激光发散器是否开启
  const disperseMode = ref(false)

  // 切换激光发散器
  function controlLaser(value: boolean) {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '01',
        param2: value ? '01' : '00',
        param3: 255,
        param4: 'ff'
      }
      patrolingCruise(data)
    } else {
      disperseMode.value = false
    }
  }

  // 开关按钮相关事件
  const switchEvent = {
    LOW_LIGHT: () => {
      lowLight.value = !lowLight.value
      toggleLight(lowLight.value, lightModes.LOWBEAM)
    },
    HIGH_LIGHT: () => {
      highLight.value = !highLight.value
      toggleLight(lowLight.value, lightModes.HIGHBEAM)
    },
    LASER: () => {
      disperseMode.value = !disperseMode.value
      controlLaser(disperseMode.value)
    },
    STOP: () => setMode(modeKey.STOP)
  }

  // 连接不同控制器下不同按键对应的切换功能
  const actionMap: ComputedRef<any[]> = computed(() => {
    const actions = new Array(20)
    if (currentControllerType.value === controllerTypes.value.WHEEL) {
      actions[1] = switchEvent.LASER
      actions[4] = switchEvent.STOP
      actions[7] = switchEvent.LOW_LIGHT
      actions[11] = switchEvent.HIGH_LIGHT
      return actions
    } else if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      actions[3] = switchEvent.LASER
      actions[4] = switchEvent.STOP
      actions[6] = switchEvent.LOW_LIGHT
      actions[7] = switchEvent.HIGH_LIGHT
      return actions
    } else {
      return actions
    }
  })

  // 监听按键按下触发不同的事件
  watch(pressedButtons, (val) => {
    if (val !== -1) {
      const actionGetter = actionMap.value[val]
      actionGetter && actionGetter()
    }
  })

  return {
    setMode,
    modeKey
  }
}
