import { connectCar } from '@/api'
import { getCarList } from '@/api/list'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { currentCar } from '@/shared'
import { ElButton, ElDivider, ElDrawer, ElOption, ElScrollbar, ElSelect } from 'element-plus'
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
  const carList: Ref<{ id: number; code: string; name: string; status: number }[]> = ref([])

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

  const { NewCurrentCarStatus } = useCarStatus(currentCarStatus())

  // 监听切换车辆后重新激活车辆
  watch(currentCar, (code: string) => {
    connectCar(code)
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
        <ElSelect
          v-model={currentCar.value}
          class="mb-5 w-full"
          placeholder={t('xuan-ze-che-liang')}
          size="large"
          onVisible-change={(visible: boolean) => visible && getList()}
        >
          {carList.value.map((item) => (
            <ElOption key={item.id} value={item.code}>
              <span>{item.name}</span>
              <span>{item.status === 1 ? '✅' : '🚫'}</span>
            </ElOption>
          ))}
        </ElSelect>
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
    <div>
      <ElButton link onClick={() => (carSettingDrawerVisible.value = true)}>
        {currentCarName.value || t('wei-xuan-ze-che-liang')}
      </ElButton>
      <span>{NewCurrentCarStatus.value}</span>
    </div>
  )

  return {
    CarRelevantDrawer,
    CarRelevantController
  }
}
