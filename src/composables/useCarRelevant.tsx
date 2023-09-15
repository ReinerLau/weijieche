import { getCarList } from '@/api/list'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { ElButton, ElDivider, ElDrawer, ElOption, ElSelect } from 'element-plus'
import { ref, type Ref } from 'vue'
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
  const carSettingDrawerVisible = ref(false)
  const currentCar = ref('')
  const carList: Ref<{ id: number; code: string; name: string; status: string }[]> = ref([])
  async function getList() {
    const { data } = await getCarList('patroling')
    carList.value = data || []
  }

  const CarRelevantDrawer = () => (
    <ElDrawer
      title="车"
      class="select-none"
      v-model={carSettingDrawerVisible.value}
      direction="ltr"
      size="80%"
    >
      <ElSelect
        v-model={currentCar.value}
        class="mb-5 w-full"
        placeholder="选择车辆"
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
        class="w-full"
        size="large"
        onClick={() => {
          isConfig.value = true
          configType.value = configTypes.CAMERA
        }}
      >
        配置监控
      </ElButton>
      <ElDivider />
      <ElButton
        class="w-full"
        size="large"
        onClick={() => {
          isConfig.value = true
          configType.value = configTypes.DEVICE
        }}
      >
        配置外设
      </ElButton>
      <ElDivider />
      <FrameSwitchOver />
      <ElDivider />
      <BirdAwayControl />
      <ElDivider />
      <PantiltControl />
    </ElDrawer>
  )
  return {
    CarRelevantDrawer,
    carSettingDrawerVisible,
    carList,
    currentCar,
    isConfig,
    configType,
    configTypes
  }
}
