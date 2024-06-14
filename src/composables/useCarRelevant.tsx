import { connectCar } from '@/api'
import { offCarWs, openCarWs } from '@/api/user'
import ActionScanning from '@/components/ActionScanning.vue'
import AlarmLightControl from '@/components/AlarmLightControl.vue'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import CarSelector from '@/components/CarSelector.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import LightControl from '@/components/LightControl.vue'
import MusicControl from '@/components/MusicControl.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { currentCar } from '@/shared'
import { useCarStore } from '@/stores/car'
import {
  ElButton,
  ElCol,
  ElDivider,
  ElDrawer,
  ElMessage,
  ElRow,
  ElScrollbar,
  ElSwitch
} from 'element-plus'
import type { Ref } from 'vue'
import { Fragment, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCarStatus } from './useCarStatus'
import { alarmLight, controlLight, handleAlarmLight } from './usePantiltControl'
import { birStatus, lightStatus, musicList, musicMessage, useUpperControl } from './useUpperControl'
// 抽屉是否可见
export const carSettingDrawerVisible = ref(false)
// 选择车左边抽屉相关
export const useCarRelevant = ({
  isConfig,
  configType,
  configTypes
}: {
  isConfig: Ref<boolean>
  configType: Ref<string>
  configTypes: {
    CAMERA: string
    DEVICE: string
  }
}) => {
  // 国际化
  const { t } = useI18n()
  const { isOpenFeedback } = useUpperControl()
  const carStore = useCarStore()
  // 当前车辆状态
  const currentCarStatus = () => {
    return carStore.carList.find((item) => item.code === currentCar.value)?.status === '1'
      ? '✅'
      : '🚫'
  }

  // 当前车辆电量
  // const currentCarBattery = () => {
  //   return carList.value.find((item) => item.code === currentCar.value)?.battery
  // }

  // const currentCarSpeed = () => {
  //   return carList.value.find((item) => item.code === currentCar.value)?.speed
  // }

  //是否断开连接
  const isConnection = ref(false)

  watch(isConnection, async () => {
    if (isConnection.value) {
      await openCarWs(currentCar.value)
      ElMessage({
        type: 'success',
        message: t('yi-lian-jie')
      })
    } else {
      await offCarWs(currentCar.value)
      ElMessage({
        type: 'success',
        message: t('yi-duan-kai-lian-jie')
      })
    }
  })

  const { NewCurrentCarStatus, NewCurrentCarBattery, NewCurrentCarSpeed } = useCarStatus(
    currentCarStatus()
  )

  // 监听切换车辆后重新激活车辆
  watch(currentCar, (code: string) => {
    connectCar(code)
    isConnection.value = false
  })
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

  // 切换按钮组
  const switchGroup = computed<SwitchGroup[]>(() => [
    {
      title: t('jin-guang-deng'),
      ref: lowLight,
      event: (value: boolean) => {
        controlLight(value, lightModes.LOWBEAM)
      },
      disabled: highLight.value || autoLight.value ? true : false
    },
    {
      title: t('yuan-guang-deng'),
      ref: highLight,
      event: (value: boolean) => {
        controlLight(value, lightModes.HIGHBEAM)
      },
      disabled: lowLight.value || autoLight.value ? true : false
    },
    {
      title: t('zi-dong-yuan-guang-deng'),
      ref: autoLight,
      event: (value: boolean) => {
        controlLight(value, lightModes.AUTOBEAM)
      },
      disabled: lowLight.value || highLight.value ? true : false
    },
    {
      title: t('jing-bao-deng'),
      ref: alarmLight,
      event: handleAlarmLight
    }
    // {
    //   title: t('ji-guang-fa-san-qi'),
    //   ref: disperseMode,
    //   event: controlLaser
    // }
  ])

  /**
   * 各种开关按钮组件
   */
  const Switchs = () => (
    <Fragment>
      <div class="mb-7">{t('che-deng-kong-zhi')}</div>
      <ElRow gutter={24} class="w-full">
        {switchGroup.value.map((item) => (
          <ElCol xs={24} sm={12}>
            <div class="flex items-center justify-between">
              <span class="mr-2">{item.title}</span>
              <ElSwitch
                v-model={item.ref.value}
                onChange={item.event}
                disabled={Boolean(item.disabled)}
              />
            </div>
          </ElCol>
        ))}
      </ElRow>
    </Fragment>
  )

  /**
   * 上装控制抽屉
   */
  const CarRelevantDrawer = () => (
    <ElDrawer
      class="select-none"
      v-model={carSettingDrawerVisible.value}
      direction="rtl"
      size="40%"
      onClose={closeDrawer}
    >
      <ElScrollbar>
        <div class="w-full px-5">
          <Switchs />
          <ElDivider />
          <AlarmLightControl />
          <ElDivider />
          <FrameSwitchOver />
          <ElDivider />
          <PantiltControl />
          <ElDivider />
          <MusicControl />
          <ElDivider />
          <BirdAwayControl />
          <ElDivider />
          <LightControl />
          <ElDivider />
          <ActionScanning />
        </div>
      </ElScrollbar>
    </ElDrawer>
  )

  function closeDrawer() {
    isOpenFeedback.value = false
    musicMessage.value = {}
    musicList.value = []
    birStatus.value = ''
    lightStatus.value = ''
  }
  // 车辆抽屉是否可见组件
  const CarRelevantController = () => (
    <div class="flex items-center">
      <CarSelector></CarSelector>
      <span class="mr-4">{NewCurrentCarStatus.value}</span>
      <ElSwitch
        class="mr-4"
        v-model={isConnection.value}
        active-text={t('lian-jie')}
        inactive-text={t('duan-kai')}
        style="--el-switch-off-color: #ff4949"
        size="small"
      />
      <span class="text-sm mr-4">
        {t('dian-liang')}: {NewCurrentCarBattery.value || 0}%
      </span>
      <span class="text-sm mr-4">
        {t('che-su')}: {NewCurrentCarSpeed.value || 0}m/s
      </span>
      <ElButton
        class="mr-4"
        size="small"
        onClick={() => {
          carSettingDrawerVisible.value = true
          isOpenFeedback.value = true
        }}
      >
        {t('shang-zhuang-kong-zhi')}
      </ElButton>
      <ElButton
        class="mr-4"
        size="small"
        onClick={() => {
          isConfig.value = true
          configType.value = configTypes.CAMERA
          carSettingDrawerVisible.value = false
        }}
      >
        {t('pei-zhi-jian-kong')}
      </ElButton>
      <ElButton
        size="small"
        onClick={() => {
          isConfig.value = true
          configType.value = configTypes.DEVICE
          carSettingDrawerVisible.value = false
        }}
      >
        {t('pei-zhi-wai-she')}
      </ElButton>
    </div>
  )

  return {
    CarRelevantDrawer,
    CarRelevantController,
    carSettingDrawerVisible
  }
}
