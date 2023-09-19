import { patrolingCruise, patrolingSetMode, patrolingVoice } from '@/api'
import { baseModes, currentCar, haveCurrentCar, modes } from '@/shared'
import { ElMenu, ElMenuItem, ElScrollbar, ElSubMenu, ElSwitch } from 'element-plus'
import { Fragment, computed, ref, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useControlSection = () => {
  const { t } = useI18n()
  const TopControl = () => (
    <ElScrollbar always={true}>
      <ElMenu mode="horizontal" ellipsis={false}>
        <Menus />
        <Switchs />
      </ElMenu>
    </ElScrollbar>
  )

  interface MenuItem {
    title: string
    subItems: { title: string; event?: () => void }[]
  }

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
    },
    {
      title: t('mo-ban'),
      subItems: [
        {
          title: t('xin-jian')
        },
        {
          title: t('bao-cun')
        },
        {
          title: t('sou-suo')
        },
        {
          title: t('qu-xiao')
        }
      ]
    },
    {
      title: t('lu-jing-gui-hua'),
      subItems: [
        {
          title: t('xin-jian')
        },
        {
          title: t('xia-fa')
        },
        {
          title: t('qu-xiao')
        }
      ]
    },
    {
      title: t('ding-shi-ren-wu'),
      subItems: [
        {
          title: t('xin-jian')
        },
        {
          title: t('sou-suo')
        }
      ]
    }
  ])

  interface SwitchGroup {
    title: string
    ref: Ref<boolean>
    event?: (value: any) => any
  }

  const frontLight = ref(false)
  const backLight = ref(false)
  const lightModes = {
    FRONT: '01',
    BACK: '02'
  }
  function toggleLight(value: boolean, mode: string) {
    const data = {
      code: currentCar.value,
      param1: '07',
      param2: value ? '01' : '00',
      param3: mode,
      param4: '00'
    }
    patrolingCruise(data)
  }
  const voice = ref(false)
  function toggleVoice(value: boolean) {
    if (haveCurrentCar()) {
      const data = {
        rid: currentCar.value,
        type: value ? '0' : '1'
      }
      patrolingVoice(data)
    }
  }

  const modeKey = {
    STOP: 'STOP' as const,
    AUTO: 'AUTO' as const,
    MANUAL: 'MANUAL' as const
  }
  function setMode(type: keyof typeof baseModes) {
    if (haveCurrentCar()) {
      const data = { baseMode: baseModes[type], customMode: modes[type] }
      patrolingSetMode(currentCar.value, data)
    }
  }
  const disperseMode = ref(false)
  function controlLaser() {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '09',
        param2: disperseMode.value ? '1' : '0',
        param3: '0',
        param4: '0'
      }
      patrolingCruise(data)
    }
  }
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

  return {
    TopControl
  }
}
