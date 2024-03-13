import { useTemplate } from '@/composables'
import { currentCar } from '@/shared'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useSchedule } from './useSchedule'
import IconMdiSignalOff from '~icons/mdi/signal-off'
import { useMapMaker } from '@/composables'
import { getCarInfo } from '@/api'
import ToolbarController from '@/components/ToolbarController.vue'
import DebugController from '@/components/DebugController.vue'
import VideoController from '@/components/VideoController.vue'
import PointConfigDrawer from '@/components/PointConfigDrawer.vue'
import { initMap, initMenu, jumpToCoordinate, map } from '@/shared/map/base'
import { initAlarmMarkerLayer } from '@/shared/map/alarm'
import { initHomePath, initHomePathDrawLayer, initHomePathLayer } from '@/shared/map/home'
import { initDrawTool } from '@/shared/map/drawTool'
import { handleConfirmPatrolTaskPath, initPatrolpathLayer } from '@/shared/map/patrolPath'
import { initTaskPointLayer, initTaskPoints } from '@/shared/map/taskPoint'
import PointSettingFormDialog from '@/components/PointSettingFormDialog'
import { handleConfirm, handleConfirmTemplate } from '@/shared/map/template'
import { handleConfirmFilePath } from '@/shared/map/file'
import { initPathLayer } from '@/shared/map/path'
import { handleCreatePlan, pathDataPoints, toolbarItems } from '@/shared/map'

export const useMap = () => {
  const MapContainer = defineComponent({
    emits: ['confirm'],
    props: {
      isMobile: {
        type: Boolean,
        required: true
      }
    },
    setup(props) {
      // 模板相关
      const { TemplateDialog, TemplateSearchDialog } = useTemplate()

      // 定时任务相关
      const { ScheduleDialog, ScheduleSearchDialog, PatrolTaskDialog, FileUploadDialog } =
        useSchedule(handleCreatePlan)

      // 车辆标记相关
      const { isConnectedWS, initMakerLayer } = useMapMaker()

      const mapRef = ref<HTMLDivElement>()

      /**
       * 初始化
       */
      function init() {
        initMap(mapRef.value!)
        initMakerLayer(map)
        initAlarmMarkerLayer()
        initPathLayer()
        initHomePathLayer()
        initHomePathDrawLayer()
        initPatrolpathLayer()
        initTaskPointLayer()
      }

      // 监听到当前车辆切换之后地图中心跳转到车辆位置
      watch(currentCar, async (code: string) => {
        const res = await getCarInfo(code)
        const x = res.data.longitude
        const y = res.data.latitude
        jumpToCoordinate(x, y)
      })

      onMounted(() => {
        init()
        initDrawTool()
        initMenu()
        initHomePath()
        initTaskPoints()
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
          <TemplateSearchDialog onConfirm={handleConfirmTemplate} />
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
  return {
    MapContainer
  }
}
