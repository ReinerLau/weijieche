import { connectCar, patrolingCruise } from '@/api'
import { getCarList } from '@/api/list'
import { openCarWs, offCarWs } from '@/api/user'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { currentCar, haveCurrentCar } from '@/shared'
import {
  ElButton,
  ElCol,
  ElDivider,
  ElDrawer,
  ElMessage,
  ElOption,
  ElRow,
  ElScrollbar,
  ElSelect,
  ElSwitch
} from 'element-plus'
import { computed, Fragment, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCarStatus } from './useCarStatus'

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

  // 可选车辆数据
  const carList: Ref<
    { id: number; code: string; name: string; status: number; battery: number }[]
  > = ref([])

  // 获取车辆数据
  async function getList() {
    const { data } = await getCarList('patroling')
    carList.value = data || []
  }

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

  // 近灯是否开启
  const lowLight = ref(false)

  // 远灯是否开启
  const highLight = ref(false)

  //自动灯是否开启
  const autoLight = ref(false)

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

  // 近远灯映射值
  const lightModes = {
    HIGHBEAM: '01',
    LOWBEAM: '02',
    AUTOBEAM: '03'
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
        if (haveCurrentCar()) {
          toggleLight(value, lightModes.LOWBEAM)
        } else {
          lowLight.value = false
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
        } else {
          highLight.value = false
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
        } else {
          autoLight.value = false
        }
      },
      disabled: lowLight.value || highLight.value ? true : false
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
      modal={false}
    >
      <ElScrollbar>
        <div class="w-full px-2">
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
      <ElSelect
        v-model={currentCar.value}
        placeholder={t('xuan-ze-che-liang')}
        size="small"
        onVisible-change={(visible: boolean) => visible && getList()}
        class="mr-2"
      >
        {carList.value.map((item) => (
          <ElOption key={item.id} value={item.code}>
            <span>{item.name}</span>
            <span>{item.status === 1 ? '✅' : '🚫'}</span>
          </ElOption>
        ))}
      </ElSelect>
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
