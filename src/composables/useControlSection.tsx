import { ElMenu, ElMenuItem, ElSubMenu, ElSwitch } from 'element-plus'
import { Fragment, ref } from 'vue'
import { useI18n } from 'vue-i18n'
export const useControlSection = () => {
  const { t } = useI18n()
  const TopControl = () => (
    <ElMenu mode="horizontal">
      {menuItems.map((menuItem) => (
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
  )

  interface MenuItem {
    title: string
    subItems: { title: string }[]
  }

  const menuItems: MenuItem[] = [
    {
      title: t('mode'),
      subItems: [
        {
          title: '手动模式'
        },
        {
          title: '自主模式'
        }
      ]
    },
    {
      title: '模板',
      subItems: [
        {
          title: '新建模板'
        },
        {
          title: '保存模板'
        },
        {
          title: '搜索模板'
        },
        {
          title: '取消模板'
        }
      ]
    },
    {
      title: '自主规划',
      subItems: [
        {
          title: '创建路径'
        },
        {
          title: '下发任务'
        },
        {
          title: '取消路径'
        }
      ]
    },
    {
      title: '定时任务',
      subItems: [
        {
          title: '新建定时任务'
        },
        {
          title: '搜索定时任务'
        }
      ]
    }
  ]

  const frontLight = ref(false)
  const switchGroup = [
    {
      title: '前灯',
      ref: frontLight
    },
    {
      title: '后灯',
      ref: frontLight
    },
    {
      title: '语音',
      ref: frontLight
    },
    {
      title: '停止',
      ref: frontLight
    },
    {
      title: '激光发散器',
      ref: frontLight
    }
  ]

  const Switchs = () => (
    <Fragment>
      {switchGroup.map((item) => (
        <ElMenuItem>
          <div class="flex items-center w-full justify-between">
            <span class="mr-2">{item.title}</span>
            <ElSwitch v-model={item.ref.value} />
          </div>
        </ElMenuItem>
      ))}
    </Fragment>
  )

  return {
    TopControl
  }
}
