import { getCarList } from '@/api/list'
import { currentCar } from '@/shared'
import { useCarStore } from '@/stores/car'

export const useCarSelector = () => {
  const carStore = useCarStore()

  const changeCar = (carCode: string) => {
    carStore.setCurrentCar(carCode)
    currentCar.value = carCode
  }

  const visibleChange = async (visible: boolean) => {
    if (visible) {
      const { data } = await getCarList('patroling')
      carStore.setCarList(data || [])
    }
  }

  return {
    changeCar,
    visibleChange
  }
}
