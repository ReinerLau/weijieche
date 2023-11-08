import { getCarInfo } from '@/api'
import CameraPlayer from '@/components/CameraPlayer.vue'
import {
  baseModes,
  cameraList,
  currentCar,
  currentController,
  currentControllerType,
  haveCurrentCar,
  modes
} from '@/shared'
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDrawer,
  ElOption,
  ElScrollbar,
  ElSelect
} from 'element-plus'
import { Fragment, computed, ref, watch } from 'vue'
import { pressedButtons } from '../shared/index'
import { useController } from './useController'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useDetail = ({ isMobile }: { isMobile: Ref<boolean> }) => {
  const { t } = useI18n()
  const detailDrawerVisible = ref(false)
  const modeText = {
    [modes.AUTO]: t('zi-zhu'),
    [modes.MANUAL]: t('shou-dong'),
    [modes.STOP]: t('ting-zhi')
  }
  const mode = computed(() => {
    return modeText[statusData.value.customMode] || t('wei-zhi')
  })
  const baseModeText = {
    [baseModes.AUTO]: t('jie-suo'),
    [baseModes.MANUAL]: t('jie-suo'),
    [baseModes.STOP]: t('suo-ding')
  }
  const baseMode = computed(() => {
    return baseModeText[statusData.value.baseMode] || t('wei-zhi')
  })

  const {
    controllers,
    controllerTypes,
    speed,
    gear,
    ControllerMapDialog,
    controllerMapDialogVisible,
    direction
  } = useController()

  watch(pressedButtons, (val) => {
    if (currentControllerType.value === controllerTypes.value.WHEEL) {
      if (val === 6) {
        gear.value = !gear.value
      }
    } else if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      if (val === 5) {
        gear.value = !gear.value
      }
    }
  })

  const status = computed(() => [
    {
      title: t('mo-shi'),
      value: mode.value
    },
    {
      title: t('di-pan'),
      value: baseMode.value
    },
    {
      title: t('kong-zhi-qi'),
      slot: () => (
        <div class="flex flex-col">
          <ElSelect v-model={currentController.value} placeholder={t('qing-xuan-ze-kong-zhi-qi')}>
            {controllers.value.map((item) => (
              <ElOption key={item.id} label={item.id} value={item.id}></ElOption>
            ))}
          </ElSelect>
          <ElSelect
            v-model={currentControllerType.value}
            placeholder={t('qing-xuan-ze-kong-zhi-qi-lei-xing')}
          >
            {Object.entries(controllerTypes.value).map(([key, value]) => (
              <ElOption key={key} label={value} value={value}></ElOption>
            ))}
          </ElSelect>
          <ElButton onClick={() => (controllerMapDialogVisible.value = true)}>
            {t('she-zhi-ying-she')}
          </ElButton>
        </div>
      )
    },
    {
      title: `${t('su-du')}: ${gear.value ? t('qian-jin') : t('hou-tui')}`,
      value: speed.value
    },
    {
      title: t('zhuan-xiang'),
      value: direction.value
    },
    {
      title: t('dian-liang'),
      value: `${statusData.value.battery || 0}%`
    },
    {
      title: t('wen-du'),
      value: statusData.value.temperature || 0
    },
    {
      title: t('shi-du'),
      value: `${statusData.value.humidity || 0}%`
    },
    {
      title: t('huo-yan'),
      value: statusData.value.blaze ? t('you-huo-yan') : t('wu-huo-yan')
    },
    {
      title: t('zao-yin'),
      value: `${statusData.value.noise || 0} DB`
    },
    {
      title: t('yan-wu'),
      value: statusData.value.smoke ? t('you-yan-wu') : t('wu-yan-wu')
    },
    {
      title: 'PM2.5',
      value: `${statusData.value.pm || 0}ug/m`
    },
    {
      title: 'PM10',
      value: `${statusData.value.pm10 || 0}ug/m³`
    },
    {
      title: t('liu-hua-qing'),
      value: `${statusData.value.h2S || 0}ug/m³`
    },
    {
      title: t('jia-wan'),
      value: `${statusData.value.ch4 || 0}ug/m³`
    },
    {
      title: t('yi-yang-hua-tan'),
      value: `${statusData.value.co || 0}ug/m³`
    }
  ])

  const statusData: Ref<Record<string, any>> = ref({})
  watch(detailDrawerVisible, async (value: boolean) => {
    if (!value) return
    if (haveCurrentCar()) {
      const res = await getCarInfo(currentCar.value)
      statusData.value = res.data
    }
  })

  const CameraSection = () => (
    <Fragment>
      {cameraList.value.map((item) => (
        <div class="bg-black h-60" key={item.id}>
          <CameraPlayer url={item.rtsp} />
        </div>
      ))}
    </Fragment>
  )

  const DetailSection = () => (
    <ElDrawer
      title="详情"
      class="select-none"
      v-model={detailDrawerVisible.value}
      direction="btt"
      size="65%"
    >
      <ElScrollbar>
        <ElDescriptions border={true} direction="vertical">
          {status.value.map((item) => (
            <ElDescriptionsItem key={item.title} label={item.title}>
              {(item.slot && item.slot()) || item.value}
            </ElDescriptionsItem>
          ))}
        </ElDescriptions>
        {isMobile.value ? <CameraSection /> : null}
      </ElScrollbar>
      <ControllerMapDialog />
    </ElDrawer>
  )
  return {
    DetailSection,
    detailDrawerVisible
  }
}
