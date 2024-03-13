import { Marker, VectorLayer } from 'maptalks'
import { map } from './base'
import { entryPoint, setEntryPoint } from './home'
import { ref, type Ref } from 'vue'
import { deletePointTask, getPointTaskList } from '@/api'
import { i18n } from '@/utils'
import { ElMessage } from 'element-plus'
import { clearDrawTool } from './drawTool'

/**
 * 任务点图层实例
 */
export let taskPointLayer: VectorLayer

export const initTaskPointLayer = () => {
  taskPointLayer = new VectorLayer('task-point')
  taskPointLayer.addTo(map)
}
/**
 * 添加任务点到图层中
 * @param taskPoint
 */
export const addTaskPointToLayer = (taskPoint: Marker) => {
  taskPointLayer.addGeometry(taskPoint)
  if (entryPoint) {
    taskPoint.setCoordinates(entryPoint.getCenter())
    setEntryPoint(null)
  }
}

/**
 * 配置路径点弹窗是否可见
 */
export const pointSettingDialogVisible = ref(false)

export const taskPoint = ref<(() => void) | null>(null)

export const pointCoordinates: Ref<string> = ref('')

export const getList = async () => {
  const res = await getPointTaskList()
  return res.data?.list || []
}

//处理添加/编辑
export const handleTaskEvent = (c: any, callback: () => void) => {
  pointCoordinates.value = ''
  taskPoint.value = () => {}
  pointSettingDialogVisible.value = true
  if (c.id) {
    pointCoordinates.value = c.gps
    form.value = Object.assign({}, c)
    if (c.cameraAngle) {
      const cameraAngle = c.cameraAngle.map((item: any) => {
        if (item.x & item.y) {
          return `${item.x},${item.y}`
        } else {
          return item
        }
      })
      form.value['cameraAngle'] = cameraAngle
    }
  } else {
    pointCoordinates.value = c
  }
  taskPoint.value = callback
}

//删除
export const deleteTaskEvent = async (id: number) => {
  await deletePointTask(id)
}

// 表单数据
export const form: Ref<Record<string, any>> = ref({})

// 在地图上显示所有任务点
export const initTaskPoints = async () => {
  taskPointLayer.clear()
  try {
    const taskPointList = await getList()
    for (const coordinate of taskPointList) {
      const taskMenuOptions = {
        items: [
          {
            item: i18n.global.t('bian-ji'),
            click: () => {
              handleTaskEvent(coordinate, () => {
                initTaskPoints()
              })
            }
          },
          {
            item: i18n.global.t('shan-chu'),
            click: async () => {
              await deleteTaskEvent(coordinate.id)
              initTaskPoints()
            }
          }
        ]
      }
      const coordinateGps = JSON.parse(coordinate.gps)
      const taskPoint = new Marker([coordinateGps.y, coordinateGps.x], {
        symbol: {
          // textName: index + 1,
          markerType: 'ellipse',
          markerFill: '#138C46',
          markerWidth: 13,
          markerHeight: 13
        }
      })
        .on('click', (e: { target: Marker }) => {
          setEntryPoint(e.target)
        })
        .setMenu(taskMenuOptions)

      addTaskPointToLayer(taskPoint)
    }
  } catch (error) {
    ElMessage({ type: 'error', message: '异常' })
  }
}

// 每次点击地图新建任务点的事件
export const taskPointDrawEndEvent = (e: { geometry: Marker }) => {
  const taskPoint = e.geometry
  taskPoint.setSymbol({
    markerType: 'ellipse',
    markerFill: '#138C46',
    markerWidth: 13,
    markerHeight: 13
  })
  const pointCoordinates = {
    x: taskPoint.getCoordinates().y,
    y: taskPoint.getCoordinates().x
  }
  handleTaskEvent(JSON.stringify(pointCoordinates), () => {
    addTaskPointToLayer(taskPoint)
    clearDrawTool()
    initTaskPoints()
  })
}
