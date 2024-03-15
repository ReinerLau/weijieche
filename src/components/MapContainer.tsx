import { currentCar } from '@/shared'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import IconMdiSignalOff from '~icons/mdi/signal-off'
import { getCarInfo } from '@/api'
import ToolbarController from '@/components/ToolbarController.vue'
import DebugController from '@/components/DebugController.vue'
import VideoController from '@/components/VideoController.vue'
import PointConfigDrawer from '@/components/PointConfigDrawer.vue'
import { initMap, jumpToCoordinate } from '@/shared/map/base'
import { initAlarmMarkerLayer } from '@/shared/map/alarm'
import { initHomePath, initHomePathLayer } from '@/shared/map/home'
import { initDrawTool } from '@/shared/map/drawTool'
import { handleConfirmPatrolTaskPath, initPatrolpathLayer } from '@/shared/map/patrolPath'
import { initTaskPointLayer, initTaskPoints } from '@/shared/map/taskPoint'
import PointSettingFormDialog from '@/components/PointSettingFormDialog'
import { handleConfirm } from '@/shared/map/template'
import { handleConfirmFilePath } from '@/shared/map/file'
import { initPathLayer } from '@/shared/map/path'
import { pathDataPoints, toolbarItems } from '@/shared/map'
import {
  addMarker,
  initMakerLayer,
  initMarker,
  isConnectedWS,
  newCarData,
  onCarPoisition,
  tryCloseWS
} from '@/shared/map/carMarker'
import { isRecord, isRecordPath, recordPathLayer, recordPathPoints } from '@/shared/map/record'
import TemplateDialog from '@/components/TemplateDialog.vue'
import TemplateSearchDialog from '@/components/TemplateSearchDialog.vue'
import ScheduleDialog from '@/components/ScheduleDialog'
import ScheduleSearchDialog from '@/components/ScheduleSearchDialog'
import PatrolTaskDialog from '@/components/PatrolTaskDialog'
import FileUploadDialog from '@/components/FileUploadDialog'
import { initTaskpathLayer } from '@/shared/map/taskPath'

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
      initPatrolpathLayer()
      initTaskPointLayer()
      initDrawTool()
      // initMenu()
      initHomePath()
      initTaskPoints()
      initTaskpathLayer()
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
        <DebugController class="absolute bottom-5 right-5 z-10" />
        {!isConnectedWS.value && (
          <IconMdiSignalOff class="absolute left-5 top-5 z-10 text-red-600" />
        )}
        <div class="h-full" ref={mapRef}></div>
        <VideoController class="absolute top-5 left-1 z-10" isMobile={props.isMobile} />
        <TemplateDialog onConfirm={handleConfirm} />
        <TemplateSearchDialog />
        <ScheduleDialog pointsdata={pathDataPoints} />
        <ScheduleSearchDialog />
        <PointSettingFormDialog />
        <PatrolTaskDialog onConfirm={handleConfirmPatrolTaskPath} />
        <FileUploadDialog onConfirm={handleConfirmFilePath} />
        <PointConfigDrawer />
      </div>
    )
  }
})
