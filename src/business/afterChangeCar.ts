import { connectCar, getCameraListByCode, getCarInfo } from '@/api'
import { cameraList } from '@/shared'
import { jumpToCoordinate } from '@/shared/map/base'
import { recordPathPoints } from '@/shared/map/record'
import { useConfigStore } from '@/stores/config'
import * as carMarker from './carMarker'
import * as carStatus from './carStatus'

const jumpToCar = async (code: string) => {
  const res = await getCarInfo(code)
  const x = res.data.longitude
  const y = res.data.latitude
  jumpToCoordinate(x, y)
}

const getCameraList = async (code: string) => {
  const res = await getCameraListByCode(code, 'patroling')
  cameraList.value = res.data
}

const handleCarStatus = () => {
  carStatus.tryCloseWS()
  carStatus.connectWebSocket()
}

const handleConfig = () => {
  const configStore = useConfigStore()
  configStore.setIsConfig(false)
}

const handleCarPoisition = (code: string) => {
  carMarker.addMarker(code)
  carMarker.onCarPoisition()
}

const clearRecordPathPoints = () => {
  recordPathPoints.length = 0
}

export default (code: string) => {
  jumpToCar(code)
  getCameraList(code)
  connectCar(code)
  handleCarPoisition(code)
  handleCarStatus()
  handleConfig()
  clearRecordPathPoints()
}
