import { getPatrolTask } from '@/api'
import PatrolTaskTableDialog from '@/components/PatrolTaskTableDialog.vue'
import { useShowCamera, useVideoTemplate } from '@/composables'
import { patrolTaskDialogVisible } from '@/shared/map/patrolPath'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  emits: ['confirm'],
  setup() {
    const list = ref<any[]>([])
    // 每次打开弹窗组件获取列表
    watch(patrolTaskDialogVisible, async (val) => {
      if (val) {
        getList()
      }
    })

    const initialParams = {
      limit: 10,
      page: 1
    }

    const params: Record<string, any> = ref(Object.assign({}, initialParams))

    const total = ref(0)

    async function getList(): Promise<void> {
      const res = await getPatrolTask(params.value)
      list.value = res.data?.list || []
      total.value = res.data ? res.data.total : 0
    }

    //打开视频
    const cameraUrl = ref('')

    const { dialogVisible: videoDialogVisible, VideoPlayDialog } = useVideoTemplate(cameraUrl)

    function handleConfirmVideo(row: any) {
      cameraUrl.value = ''
      videoDialogVisible.value = true
      cameraUrl.value = row.videoPath
    }

    //打开摄像画面

    const cameraList: any = ref([])
    const { showCameraDialogVisible, ShowCameraDialog } = useShowCamera(cameraList)

    function handleConfirmCamera(row: any) {
      cameraList.value.length = 0
      showCameraDialogVisible.value = true
      if (row.picPath) {
        cameraList.value = row.picPath
      } else {
        cameraList.value.length = 0
      }
    }

    return () => (
      <div>
        <PatrolTaskTableDialog
          onCameraConfirm={handleConfirmCamera}
          onVideoConfirm={handleConfirmVideo}
        ></PatrolTaskTableDialog>
        <VideoPlayDialog />
        <ShowCameraDialog />
      </div>
    )
  }
})
