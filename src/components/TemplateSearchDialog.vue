<script setup lang="ts">
import { deleteTemplate, getTemplatePathList } from '@/api'
import { jumpToCoordinate } from '@/shared/map/base'
import { clearDrawTool } from '@/shared/map/drawTool'
import { clearOnePoint, handleCreateHomePath, setEntryPoint, setOnePoint } from '@/shared/map/home'
import {
  addPathPointToLayer,
  clearPathLayer,
  pathLayer,
  pathPointList,
  pathPointsData
} from '@/shared/map/path'
import {
  carSpeedData,
  currentSelectedPointIndex,
  handlePointConfigEvent,
  pointConfigDrawerVisible
} from '@/shared/map/pointConfig'
import { handleTaskEvent, initTaskPoints } from '@/shared/map/taskPoint'
import { missionTemplateId, templateSearchDialogVisible } from '@/shared/map/template'
import type { Coordinate, TemplateData } from '@/types'
import { ElMessage } from 'element-plus'
import { Marker } from 'maptalks'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const initialParams = {
  limit: 10,
  page: 1,
  rtype: 'patroling'
}

const params: Record<string, any> = ref(Object.assign({}, initialParams))

const queryFields = [
  {
    prop: 'name',
    title: t('ren-wu-ming-cheng')
  },
  {
    prop: 'memo',
    title: t('bei-zhu')
  }
]

const list = ref<any[]>([])
const total = ref(0)

// 获取列表数据
async function getList() {
  const res = await getTemplatePathList(params.value)
  list.value = res.data.list || []
  total.value = res.data ? res.data.total : 0
}

function handleQuery() {
  getList()
}

function handleReset() {
  params.value = Object.assign({}, initialParams)
  getList()
}

let currentTemplate: TemplateData | null

function onCurrentChange(val: TemplateData) {
  currentTemplate = val
}
// 删除模板
async function handleDelete(id: number) {
  await deleteTemplate(id)
  getList()
}

const onComfirm = () => {
  if (currentTemplate) {
    handleConfirmTemplate(currentTemplate)
    templateSearchDialogVisible.value = false
  } else {
    ElMessage({
      type: 'warning',
      message: t('wei-xuan-ze-mo-ban')
    })
  }
}

const getMarkerFill = (index: number, thelastIndex: number) => {
  if (index === 0) {
    return '#FF0070'
  } else if (index === thelastIndex) {
    return '#FF0070'
  } else {
    return '#8D70DD'
  }
}

const getPointInstance = (index: number, coordinate: Coordinate, theLastIndex: number) => {
  return new Marker([coordinate.y, coordinate.x], {
    symbol: {
      markerType: index === 0 ? 'diamond' : 'ellipse',
      markerFill: getMarkerFill(index, theLastIndex),
      markerWidth: 15,
      markerHeight: 15
    }
  })
}

const handleConfirmTemplate = (template: TemplateData) => {
  setEntryPoint(null)
  clearOnePoint()
  pathPointList.length = 0
  clearDrawTool()
  clearPathLayer()
  missionTemplateId.value = template.id
  const coordinates: Coordinate[] = JSON.parse(template.mission)
  const theLastIndex = coordinates.length - 1
  coordinates.forEach((coordinate, index) => {
    const pathPoint = getPointInstance(index, coordinate, theLastIndex)
    pathPoint
      .setMenu({
        items: [
          {
            item: t('xin-zeng-ren-wu-dian'),
            click: () => {
              const pointCoordinates = {
                x: pathPoint.getCoordinates().y,
                y: pathPoint.getCoordinates().x
              }
              handleTaskEvent(JSON.stringify(pointCoordinates), () => {
                pathLayer.addGeometry(pathPoint)
                clearDrawTool()
                initTaskPoints()
              })
            }
          },
          {
            item: t('tian-jia-fan-hang-dian'),
            click: handleCreateHomePath
          },
          {
            item: t('bian-ji-che-su'),
            click: () => {
              const pointCoordinates: {
                x: number
                y: number
              } = {
                x: pathPoint.getCoordinates().y,
                y: pathPoint.getCoordinates().x
              }
              currentSelectedPointIndex.value = index
              //保存已有车速值
              let carNum: string = carSpeedData.value[index] || ''
              if (!carSpeedData.value[index]) {
                const templateData: any = JSON.parse(template.mission)[index]
                if (templateData.speed) {
                  carNum = templateData.speed.toString()
                }
              }
              pointConfigDrawerVisible.value = true
              handlePointConfigEvent(pointCoordinates, carNum)
            }
          }
        ]
      })
      .on('click', (e: { target: Marker }) => {
        setEntryPoint(e.target)
        setOnePoint(e.target)
      })
    addPathPointToLayer(pathPoint)
    const pointCoordinates = {
      x: pathPoint.getCoordinates().y,
      y: pathPoint.getCoordinates().x
    }
    pathPointList.push(pointCoordinates)
    pathPointsData.value = JSON.parse(template.mission)
  })

  jumpToCoordinate(pathPointList[0].y, pathPointList[0].x)
}

const clearCurrentTemplate = () => {
  currentTemplate = null
}

// 每次打开搜索弹窗重新获取数据
watch(templateSearchDialogVisible, async (val) => {
  clearCurrentTemplate()
  if (val) {
    getList()
  }
})
</script>

<template>
  <el-dialog v-model="templateSearchDialogVisible" :title="t('mo-ban')" width="50vw" align-center>
    <template #header>
      <div class="flex flex-col">
        <span class="mb-3">{{ t('lu-xian-mo-ban') }}</span>
        <el-scrollbar>
          <div class="flex justify-between">
            <div v-for="item in queryFields" :key="item.prop">
              <el-input v-model="params[item.prop]" :placeholder="item.title" clearable></el-input>
            </div>
          </div>
        </el-scrollbar>
        <div class="flex pt-2">
          <el-button type="primary" class="mr-2" @click="handleQuery">{{ t('cha-xun') }}</el-button>
          <el-button type="info" @click="handleReset">{{ t('zhong-zhi') }}</el-button>
        </div>
      </div>
    </template>
    <template #default>
      <div class="flex flex-col">
        <el-table height="50vh" :data="list" highlight-current-row @currentChange="onCurrentChange">
          <el-table-column property="name" :label="t('ming-cheng')" />
          <el-table-column property="memo" :label="t('bei-zhu')" />
          <el-table-column property="createTime" :label="t('chuang-jian-shi-jian')" />
          <el-table-column :label="t('cao-zuo')">
            <template #default="{ row }">
              <el-button link @click="() => handleDelete(row.id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-2">
          <el-scrollbar class="mt-2">
            <el-pagination
              layout="sizes, prev, pager, next"
              :total="total"
              v-model:current-page="params.page"
              v-model:page-size="params.limit"
              :page-sizes="[10, 20, 50, 100, 200, 500]"
              @sizeChange="getList"
              @currentChange="getList"
            />
          </el-scrollbar>
        </div>
      </div>
    </template>
    <template #footer>
      <el-button size="large" type="primary" class="w-full" @click="onComfirm">{{
        t('que-ding')
      }}</el-button>
    </template>
  </el-dialog>
</template>
