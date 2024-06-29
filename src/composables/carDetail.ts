import { getCarInfo } from '@/api'
import { useCarStore } from '@/stores/car'
import { ref, type Ref } from 'vue'

export let intervalId: any

// 底部抽屉是否可见
export const detailDrawerVisible = ref(false)
// 状态数据
export const statusData: Ref<Record<string, any>> = ref({})
export const getDetailDrawer = async (value: boolean) => {
  clearInterval(intervalId)
  intervalId = null
  updateData()
  intervalId = setInterval(updateData, 1000)
  if (!value) {
    if (intervalId) {
      // 抽屉关闭时停止定时获取数据
      clearInterval(intervalId)
      intervalId = null
    }
    return
  }
}

export async function updateData() {
  const carStore = useCarStore()
  const res = await getCarInfo(carStore.currentCar!)
  statusData.value = res.data
}
