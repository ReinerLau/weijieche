import { patrolingCruise, patrolingSetMode, patrolingVoice } from '@/api'
import {
  baseModes,
  controllerTypes,
  currentCar,
  currentControllerType,
  haveCurrentCar,
  modes,
  pressedButtons
} from '@/shared'
import { ElMenu, ElMenuItem, ElScrollbar, ElSubMenu, ElSwitch } from 'element-plus'
import { Fragment, computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 顶部操控相关
export const useControlSection = () => {
  // 国际化
  const { t } = useI18n()
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
    event?: (value: any) => any
  }

  // 前灯是否开启
  const frontLight = ref(false)

  // 后灯是否开启
  const backLight = ref(false)

  // 前后灯映射值
  const lightModes = {
    FRONT: '01',
    BACK: '02'
  }

  // 切换前后灯相关事件
  function toggleLight(value: boolean, mode: string) {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '07',
        param2: value ? '01' : '00',
        param3: mode,
        param4: '00'
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
        param1: '09',
        param2: value ? '1' : '0',
        param3: '0',
        param4: '0'
      }
      patrolingCruise(data)
    }
  }

  // 切换按钮组
  const switchGroup: ComputedRef<SwitchGroup[]> = computed(() => [
    {
      title: t('qian-deng'),
      ref: frontLight,
      event: (value: boolean) => {
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.FRONT)
        }
      }
    },
    {
      title: t('hou-deng'),
      ref: backLight,
      event: (value: boolean) => {
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.BACK)
        }
      }
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
            <ElSwitch v-model={item.ref.value} onChange={item.event} />
          </div>
        </ElMenuItem>
      ))}
    </Fragment>
  )

  // 开关按钮相关事件
  const switchEvent = {
    FRONT_LIGHT: () => {
      frontLight.value = !frontLight.value
      toggleLight(frontLight.value, lightModes.FRONT)
    },
    BACK_LIGHT: () => {
      backLight.value = !backLight.value
      toggleLight(frontLight.value, lightModes.BACK)
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
      actions[7] = switchEvent.FRONT_LIGHT
      actions[11] = switchEvent.BACK_LIGHT
      return actions
    } else if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      actions[3] = switchEvent.LASER
      actions[4] = switchEvent.STOP
      actions[6] = switchEvent.FRONT_LIGHT
      actions[7] = switchEvent.BACK_LIGHT
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
