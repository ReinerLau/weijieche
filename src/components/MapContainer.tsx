import { getCarInfo } from '@/api'
import DebugController from '@/components/DebugController.vue'
import PointConfigDrawer from '@/components/PointConfigDrawer.vue'
import PointSettingFormDialog from '@/components/PointSettingFormDialog'
import RecordPointCount from '@/components/RecordPointCount.vue'
import ToolbarController from '@/components/ToolbarController.vue'
import VideoController from '@/components/VideoController.vue'
import { currentCar } from '@/shared'
import { pathDataPoints, toolbarItems } from '@/shared/map'
import { initAlarmMarkerLayer } from '@/shared/map/alarm'
import { initMap, jumpToCoordinate } from '@/shared/map/base'
import { initDrawTool } from '@/shared/map/drawTool'
import { handleConfirmFilePath } from '@/shared/map/file'
import { initHomePath, initHomePathLayer } from '@/shared/map/home'
import { initPathLayer } from '@/shared/map/path'
import { handleConfirmPatrolTaskPath, initPatrolpathLayer } from '@/shared/map/patrolPath'
import { initTaskPointLayer, initTaskPoints } from '@/shared/map/taskPoint'
import { handleConfirm } from '@/shared/map/template'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import IconMdiSignalOff from '~icons/mdi/signal-off'

import FileUploadDialog from '@/components/FileUploadDialog'
import PatrolTaskDialog from '@/components/PatrolTaskDialog'
import RoadnetPathTableDialog from '@/components/RoadnetPathTableDialog.vue'
import ScheduleDialog from '@/components/ScheduleDialog'
import ScheduleSearchDialog from '@/components/ScheduleSearchDialog'
import TemplateDialog from '@/components/TemplateDialog.vue'
import TemplateSearchDialog from '@/components/TemplateSearchDialog.vue'
import { alarmMessageData, initAlarmPointLayer } from '@/shared/map/alarmPoint'
import {
  addMarker,
  initMakerLayer,
  initMarker,
  isConnectedWS,
  newCarData,
  onCarPoisition,
  tryCloseWS
} from '@/shared/map/carMarker'
import { onMapDBClick } from '@/shared/map/debug'
import { isRecord, isRecordPath, recordPathLayer, recordPathPoints } from '@/shared/map/record'
import { initRoadnetPathLayer } from '@/shared/map/roadnet'
import { initTaskpathLayer } from '@/shared/map/taskPath'
import ShowAlarmMessageDialog from './ShowAlarmMessageDialog'

export default defineComponent({
  emits: ['confirm'],
  props: {
    isMobile: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const mapRef = ref<HTMLDivElement>()

    // 监听到当前车辆切换之后地图中心跳转到车辆位置
    watch(currentCar, async (code: string) => {
      const res = await getCarInfo(code)
      const x = res.data.longitude
      const y = res.data.latitude
      jumpToCoordinate(x, y)
    })

    onMounted(() => {
      initMap(mapRef.value!)
      initHomePathLayer()
      initMakerLayer()
      initAlarmMarkerLayer()
      initPathLayer()
      initRoadnetPathLayer()
      initPatrolpathLayer()
      initAlarmPointLayer()
      initTaskPointLayer()
      initDrawTool()
      initHomePath()
      initTaskPoints()
      initTaskpathLayer()
      onMapDBClick()
    })

    // 监听到选择车辆后连接 websocket
    watch(currentCar, (code: string) => {
      recordPathPoints.length = 0
      addMarker(code)
      tryCloseWS()
      onCarPoisition()
    })

    // 关闭页面前先关闭 websocket
    onBeforeUnmount(tryCloseWS)

    // 监听是否处于录制状态
    watch(isRecordPath, () => {
      if (!isRecord.value && !isRecordPath.value) {
        recordPathLayer.clear()
        initMarker(newCarData.value)
      }
    })

    watch(isRecord, () => {
      if (!isRecord.value) {
        recordPathLayer.clear()
        initMarker(newCarData.value)
      }
    })

    return () => (
      <div class="h-full relative">
        <ToolbarController class="absolute top-5 right-5 z-10" items={toolbarItems} />
        <RecordPointCount class="absolute top-24 right-5 z-10"></RecordPointCount>
        <DebugController class="absolute bottom-5 right-5 z-10" />
        {!isConnectedWS.value && (
          <IconMdiSignalOff class="absolute left-5 top-5 z-10 text-red-600" />
        )}
        <div class="h-full" ref={mapRef}></div>
        <VideoController class="absolute top-5 left-1 z-10" isMobile={props.isMobile} />
        <TemplateDialog onConfirm={handleConfirm} />
        <TemplateSearchDialog />
        <RoadnetPathTableDialog />
        <ScheduleDialog pointsdata={pathDataPoints} />
        <ScheduleSearchDialog />
        <PointSettingFormDialog />
        <PatrolTaskDialog onConfirm={handleConfirmPatrolTaskPath} />
        <FileUploadDialog onConfirm={handleConfirmFilePath} />
        <PointConfigDrawer />
        <ShowAlarmMessageDialog alarmMessage={alarmMessageData.value} />
      </div>
    )
  }
})
