import { connectCar } from '@/api'
import { offCarWs, openCarWs } from '@/api/user'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import CarSelector from '@/components/CarSelector.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { carList, currentCar, haveCurrentCar } from '@/shared'
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
import {
  alarmLight,
  autoLight,
  controlLight,
  handleAlarmLight,
  highLight,
  lightModes,
  lowLight
} from './usePantiltControl'

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

  // 抽屉是否可见
  const carSettingDrawerVisible = ref(false)

  // 当前车辆状态
  const currentCarStatus = () => {
    return carList.value.find((item) => item.code === currentCar.value)?.status === 1 ? '✅' : '🚫'
  }

  // 当前车辆电量
  const currentCarBattery = () => {
    return carList.value.find((item) => item.code === currentCar.value)?.battery
  }

  //是否断开连接
  const isConnection = ref(false)

  watch(isConnection, async () => {
    if (haveCurrentCar()) {
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
    } else {
      isConnection.value = false
    }
  })

  const { NewCurrentCarStatus, NewCurrentCarBattery } = useCarStatus(
    currentCarStatus(),
    currentCarBattery()
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

  // 激光发散器是否开启
  // const disperseMode = ref(false)

  // 切换激光发散器
  // function controlLaser(value: boolean) {
  //   if (haveCurrentCar()) {
  //     const data = {
  //       code: currentCar.value,
  //       param1: '01',
  //       param2: value ? '01' : '00',
  //       param3: 255,
  //       param4: 'ff'
  //     }
  //     patrolingCruise(data)
  //   } else {
  //     disperseMode.value = false
  //   }
  // }

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
      <div class="mb-7">{t('deng-guang-kong-zhi')}</div>
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
    >
      <ElScrollbar>
        <div class="w-full px-5">
          <Switchs />
          <ElDivider />
          <PantiltControl />
          <ElDivider />
          <BirdAwayControl />
          <ElDivider />
          <FrameSwitchOver />
        </div>
      </ElScrollbar>
    </ElDrawer>
  )

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
      <ElButton
        class="mr-4"
        size="small"
        onClick={() => {
          carSettingDrawerVisible.value = true
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
    CarRelevantController
  }
}
