import { patrolingCruise } from '@/api'
import { ElMenu, ElMenuItem, ElScrollbar, ElSubMenu, ElSwitch } from 'element-plus'
import { Fragment, computed, ref, type ComputedRef, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useControlSection = ({ currentCar }: { currentCar: Ref<string> }) => {
  const { t } = useI18n()
  const TopControl = () => (
    <ElScrollbar always={true}>
      <ElMenu mode="horizontal" ellipsis={false}>
        {menuItems.value.map((menuItem) => (
          <ElSubMenu index={menuItem.title}>
            {{
              title: () => menuItem.title,
              default: () => (
                <Fragment>
                  {menuItem.subItems.map((item) => (
                    <ElMenuItem index={item.title}>{item.title}</ElMenuItem>
                  ))}
                </Fragment>
              )
            }}
          </ElSubMenu>
        ))}
        <Switchs />
      </ElMenu>
    </ElScrollbar>
  )

  interface MenuItem {
    title: string
    subItems: { title: string }[]
  }

  const menuItems: ComputedRef<MenuItem[]> = computed(() => [
    {
      title: t('mo-shi'),
      subItems: [
        {
          title: t('shou-dong')
        },
        {
          title: t('zi-zhu')
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
  const switchGroup: ComputedRef<SwitchGroup[]> = computed(() => [
    {
      title: t('qian-deng'),
      ref: frontLight,
      event: (value: boolean) => {
        toggleLight(value, lightModes.FRONT)
      }
    },
    {
      title: t('hou-deng'),
      ref: frontLight
    },
    {
      title: t('yu-yin'),
      ref: frontLight
    },
    {
      title: t('ting-zhi'),
      ref: frontLight
    },
    {
      title: t('ji-guang-fa-san-qi'),
      ref: frontLight
    }
  ])

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
