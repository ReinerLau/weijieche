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
  const { t } = useI18n()
  const carSettingDrawerVisible = ref(false)
  const carList: Ref<{ id: number; code: string; name: string; status: string }[]> = ref([])
  async function getList() {
    const { data } = await getCarList('patroling')
    carList.value = data || []
  }

  const currentCarName = computed(() => {
    return carList.value.find((item) => item.code === currentCar.value)?.name
  })
  const currentCarStatus = computed(() => {
    return carList.value.find((item) => item.code === currentCar.value)?.status === '1'
      ? '✅'
      : '🚫'
  })

  watch(currentCar, (code: string) => {
    connectCar(code)
  })

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
              <span>{item.status === '1' ? '✅' : '🚫'}</span>
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
        {/* <ElButton
          class="w-full"
          size="large"
          onClick={() => {
            isConfig.value = true
            configType.value = configTypes.DEVICE
            carSettingDrawerVisible.value = false
          }}
        >
          配置外设
        </ElButton> */}
        <ElDivider />
        <FrameSwitchOver />
        <ElDivider />
        <BirdAwayControl />
        <ElDivider />
        <PantiltControl />
      </ElScrollbar>
    </ElDrawer>
  )

  const CarRelevantController = () => (
    <div>
      <ElButton link onClick={() => (carSettingDrawerVisible.value = true)}>
        {currentCarName.value || t('wei-xuan-ze-che-liang')}
      </ElButton>
      <span>{currentCarStatus.value}</span>
    </div>
  )

  return {
    CarRelevantDrawer,
    CarRelevantController
  }
}
