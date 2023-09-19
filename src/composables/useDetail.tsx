import { ElDescriptions, ElDescriptionsItem, ElDrawer } from 'element-plus'
import { Fragment, computed, ref, watch, type Ref } from 'vue'
import { getCarInfo } from '../api/index'
import { currentCar, haveCurrentCar } from '../shared/index'
export const useDetail = ({ isMobile }: { isMobile: Ref<boolean> }) => {
  const detailDrawerVisible = ref(false)
  const status = computed(() => [
    {
      title: '模式',
      value: '手动模式'
    },
    {
      title: '底盘',
      value: '锁定'
    },
    {
      title: '控制',
      value: '未知'
    },
    {
      title: '速度',
      value: 1000
    },
    {
      title: '转向',
      value: 1000
    },
    {
      title: '电量',
      value: '100%'
    },
    {
      title: '温度',
      value: statusData.value.temperature || 0
    },
    {
      title: '湿度',
      value: `${statusData.value.humidity || 0}%`
    },
    {
      title: '火焰',
      value: statusData.value.blaze ? '有火焰' : '无火焰'
    },
    {
      title: '噪音',
      value: `${statusData.value.noise || 0} DB`
    },
    {
      title: '烟雾',
      value: statusData.value.smoke ? '有烟雾' : '无烟雾'
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
      title: '硫化氢',
      value: `${statusData.value.h2S || 0}ug/m³`
    },
    {
      title: '甲烷',
      value: `${statusData.value.ch4 || 0}ug/m³`
    },
    {
      title: '一氧化碳',
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
      <div class="bg-black h-60 mt-2">1</div>
      <div class="bg-black h-60 mt-2">2</div>
      <div class="bg-black h-60 mt-2">3</div>
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
      <ElDescriptions border={true} direction="vertical">
        {status.value.map((item) => (
          <ElDescriptionsItem key={item.title} label={item.title}>
            {item.value}
          </ElDescriptionsItem>
        ))}
      </ElDescriptions>
      {isMobile.value ? <CameraSection /> : null}
    </ElDrawer>
  )
  return {
    DetailSection,
    detailDrawerVisible
  }
}
