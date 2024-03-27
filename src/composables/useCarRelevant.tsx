import { connectCar } from '@/api'
import { getCarList } from '@/api/list'
import { openCarWs, offCarWs } from '@/api/user'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { currentCar, haveCurrentCar } from '@/shared'
import {
  ElButton,
  ElDivider,
  ElDrawer,
  ElMessage,
  ElOption,
  ElScrollbar,
  ElSelect,
  ElSwitch
} from 'element-plus'
import { computed, ref, watch } from 'vue'
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

  // 当前车辆名字
  const currentCarName = computed(() => {
    return carList.value.find((item) => item.code === currentCar.value)?.name
  })

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

  // 车辆相关抽屉
  const CarRelevantDrawer = () => (
    <ElDrawer
      class="select-none"
      v-model={carSettingDrawerVisible.value}
      direction="ltr"
      size="80%"
    >
      <ElScrollbar>
        <ElButton
          class="w-full mb-5"
          size="large"
          onClick={() => {
            isConfig.value = true
            configType.value = configTypes.CAMERA
            carSettingDrawerVisible.value = false
          }}
        >
          {t('pei-zhi-jian-kong')}
        </ElButton>
        <ElButton
          class="w-full"
          size="large"
          onClick={() => {
            isConfig.value = true
            configType.value = configTypes.DEVICE
            carSettingDrawerVisible.value = false
          }}
        >
          {t('pei-zhi-wai-she')}{' '}
        </ElButton>
        <ElDivider />
        <FrameSwitchOver />
        <ElDivider />
        <BirdAwayControl />
        <ElDivider />
        <PantiltControl />
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
      <span class="mr-6">{NewCurrentCarStatus.value}</span>
      <ElSwitch
        class="mr-6"
        v-model={isConnection.value}
        active-text={t('lian-jie')}
        inactive-text={t('duan-kai')}
        style="--el-switch-off-color: #ff4949"
        size="small"
      />
      <span class="text-sm">
        {t('dian-liang')}: {NewCurrentCarBattery.value || 0}%
      </span>
      {/* <ElButton link onClick={() => (carSettingDrawerVisible.value = true)}>
        {currentCarName.value || t('wei-xuan-ze-che-liang')}
      </ElButton> */}
    </div>
  )

  return {
    CarRelevantDrawer,
    CarRelevantController
  }
}
