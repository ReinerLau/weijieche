import { ElDescriptions, ElDescriptionsItem, ElDrawer } from 'element-plus'
import { Fragment, ref, type Ref } from 'vue'
export const useDetail = ({ isMobile }: { isMobile: Ref<boolean> }) => {
  const detailDrawerVisible = ref(false)
  const status = [
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
      value: '-0.1℃'
    },
    {
      title: '湿度',
      value: '-0.1℃'
    },
    {
      title: '火焰',
      value: '-0.1℃'
    },
    {
      title: '噪音',
      value: '-0.1℃'
    },
    {
      title: '烟雾',
      value: '-0.1℃'
    },
    {
      title: 'PM2.5',
      value: '-0.1℃'
    },
    {
      title: 'PM10',
      value: '-0.1℃'
    },
    {
      title: '硫化氢',
      value: '-0.1℃'
    },
    {
      title: '甲烷',
      value: '-0.1℃'
    },
    {
      title: '一氧化碳',
      value: '-0.1℃'
    }
  ]

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
        {status.map((item) => (
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
