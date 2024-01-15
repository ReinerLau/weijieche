import { patrolingCruise, patrolingSetMode, patrolingVoice } from '@/api'
import {
  baseModes,
  controllerTypes,
  currentCar,
  currentControllerType,
  modes,
  pressedButtons
} from '@/shared'
import { ElMenu, ElMenuItem, ElMessage, ElScrollbar, ElSubMenu, ElSwitch } from 'element-plus'
import { Fragment, computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 顶部操控相关
export const useControlSection = () => {
  // 国际化
  const { t } = useI18n()

  // 判断车辆
  function haveCurrentCar() {
    if (currentCar.value) {
      return true
    } else {
      ElMessage({ type: 'error', message: t('qing-xuan-ze-che-liang') })
      return false
    }
  }

  // 顶部操控区域组件

  const TopControl = () => (
    <ElScrollbar always={true}>
      <ElMenu mode="horizontal" ellipsis={false}>
        <Menus />
        <Switchs />
      </ElMenu>
    </ElScrollbar>
  )

  // 每个模式数据结构的类型声明
  interface MenuItem {
    title: string
    subItems: { title: string; event?: () => void }[]
  }

  // 模式选项
  const menuItems: ComputedRef<MenuItem[]> = computed(() => [
    {
      title: t('mo-shi'),
      subItems: [
        {
          title: t('shou-dong'),
          event: () => setMode(modeKey.MANUAL)
        },
        {
          title: t('zi-zhu'),
          event: () => setMode(modeKey.AUTO)
        },
        {
          title: t('ting-zhi'),
          event: () => setMode(modeKey.STOP)
        }
      ]
    }
  ])

  interface SwitchGroup {
    title: string
    ref: Ref<boolean>
    disabled?: Ref<boolean> | boolean
    event?: (value: any) => any
  }

  // 近灯是否开启
  const lowLight = ref(false)

  // 远灯是否开启
  const highLight = ref(false)

  //自动灯是否开启
  const autoLight = ref(false)

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

  // 语音是否开启
  const voice = ref(false)

  // 切换语音开启
  function toggleVoice(value: boolean) {
    if (haveCurrentCar()) {
      const data = {
        rid: currentCar.value,
        type: value ? '0' : '1'
      }
      patrolingVoice(data)
    }
  }

  // 可选模式值
  const modeKey = {
    STOP: 'STOP' as const,
    AUTO: 'AUTO' as const,
    MANUAL: 'MANUAL' as const
  }

  // 设置模式
  function setMode(type: keyof typeof baseModes) {
    if (haveCurrentCar()) {
      const data = { baseMode: baseModes[type], customMode: modes[type] }
      patrolingSetMode(currentCar.value, data)
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
    }
  }

  // 切换按钮组
  const switchGroup: ComputedRef<SwitchGroup[]> = computed(() => [
    {
      title: t('jin-guang-deng'),
      ref: lowLight,
      event: (value: boolean) => {
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.LOWBEAM)
        }
      },
      disabled: highLight.value || autoLight.value ? true : false
    },
    {
      title: t('yuan-guang-deng'),
      ref: highLight,
      event: (value: boolean) => {
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.HIGHBEAM)
        }
      },
      disabled: lowLight.value || autoLight.value ? true : false
    },
    {
      title: t('zi-dong-yuan-guang-deng'),
      ref: autoLight,
      event: (value: boolean) => {
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.AUTOBEAM)
        }
      },
      disabled: lowLight.value || highLight.value ? true : false
    },
    {
      title: t('yu-yin'),
      ref: voice,
      event: toggleVoice
    },

    {
      title: t('ji-guang-fa-san-qi'),
      ref: disperseMode,
      event: controlLaser
    }
  ])

  // 模式切换组件
  const Menus = () => (
    <Fragment>
      {menuItems.value.map((menuItem) => (
        <ElSubMenu index={menuItem.title}>
          {{
            title: () => menuItem.title,
            default: () => (
              <Fragment>
                {menuItem.subItems.map((item) => (
                  <ElMenuItem index={item.title} onClick={item.event}>
                    {item.title}
                  </ElMenuItem>
                ))}
              </Fragment>
            )
          }}
        </ElSubMenu>
      ))}
    </Fragment>
  )

  // 各种开关按钮组件
  const Switchs = () => (
    <Fragment>
      {switchGroup.value.map((item) => (
        <ElMenuItem index={item.title}>
          <div class="flex items-center w-full justify-between">
            <span class="mr-2">{item.title}</span>
            <ElSwitch
              v-model={item.ref.value}
              onChange={item.event}
              disabled={Boolean(item.disabled)}
            />
          </div>
        </ElMenuItem>
      ))}
    </Fragment>
  )

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
    TopControl
  }
}
