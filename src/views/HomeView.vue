<script setup lang="ts">
import { getCarList } from '@/api/list'
import BirdAwayControl from '@/components/BirdAwayControl.vue'
import FrameSwitchOver from '@/components/FrameSwitchOver.vue'
import PantiltControl from '@/components/PantiltControl.vue'
import { useControlSection } from '@/composables'
import { useDark, useToggle } from '@vueuse/core'
import { computed, reactive, ref, type Ref } from 'vue'
const carSettingDrawerVisible = ref(false)
const carList: Ref<{ id: number; code: string; name: string; status: string }[]> = ref([])
const currentCar = ref('')
const currentCarName = computed(() => {
  return carList.value.find((item) => item.code === currentCar.value)?.name
})
const currentCarStatus = computed(() => {
  return carList.value.find((item) => item.code === currentCar.value)?.status === '1' ? '✅' : '🚫'
})
async function getList() {
  const { data } = await getCarList('patroling')
  carList.value = data || []
}
getList()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const { TopControl } = useControlSection()

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

interface websocketData {
  id: string
  type: string
  message: string
  time?: string
}

const notificationDrawerVisible = ref(false)
const notifications: websocketData[] = reactive([
  {
    id: '1',
    type: 'warning',
    message: 'test',
    time: '2023-09-13'
  }
])
function notificationType(type: string) {
  switch (type) {
    case 'warning':
      return 'bg-[#fbde47] text-[#000]'
    case 'error':
      return 'bg-[#dd0612] text-[#fff]'
    default:
      return 'bg-[#4d99f9] text-[#fff]'
  }
}

const configTypes = {
  CAMERA: 'CAMERA',
  DEVICE: 'DEVICE'
}

const isConfig = ref(false)
const configType = ref('')
const configData: Ref<any[]> = ref([])
const configColumns = computed(() => {
  if (configType.value === configTypes.CAMERA) {
    return [
      {
        label: '编号',
        prop: 'id'
      },
      {
        label: '摄像头名称',
        prop: 'name'
      },
      {
        label: '品牌',
        prop: 'brand'
      },
      {
        label: 'ip地址',
        prop: 'ip'
      },
      {
        label: '端口',
        prop: 'port'
      },
      {
        label: '关联车辆',
        prop: 'rid'
      }
    ]
  } else if (configType.value === configTypes.DEVICE) {
    return [
      {
        label: '设备编号',
        prop: 'id'
      },
      {
        label: '外设名称',
        prop: 'name'
      },
      {
        label: '外设类型',
        prop: 'type'
      },
      {
        label: '外设状态',
        prop: 'status'
      },
      {
        label: '操作',
        prop: 'action'
      }
    ]
  } else {
    return []
  }
})

const cameraWidth = ref(12)
window.onresize = () => {
  if (screen.width < 1920) {
    cameraWidth.value = 24
  } else {
    cameraWidth.value = 12
  }
}
</script>

<template>
  <el-container class="h-full">
    <el-header>
      <div class="h-full flex items-center justify-between">
        <div>
          <el-button link c @click="carSettingDrawerVisible = true">{{
            currentCarName || '未选择车辆'
          }}</el-button>
          <span>{{ currentCarStatus }}</span>
        </div>
        <el-button link @click="toggleDark()">{{ isDark ? '☀️' : '🌙' }}</el-button>
        <el-button link @click="notificationDrawerVisible = true">
          <el-badge :value="notifications.length" :hidden="notifications.length === 0">
            <i-mdi-bell-outline />
          </el-badge>
        </el-button>
      </div>
    </el-header>
    <el-main v-if="isConfig" id="main" class="h-0">
      <el-page-header @back="isConfig = false" />
      <el-divider></el-divider>
      <el-button size="large">添加</el-button>
      <el-table :data="configData" class="">
        <el-table-column
          v-for="item in configColumns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        />
      </el-table>
    </el-main>
    <el-container v-else>
      <el-header>
        <TopControl />
      </el-header>
      <el-main>
        <div class="h-[calc(100vh-160px)] overflow-y-auto">
          <div class="bg-slate-500 h-[calc(100vh-160px)]">1</div>
          <el-row>
            <el-col :span="cameraWidth">
              <div class="bg-black h-96">1</div>
            </el-col>
            <el-col :span="cameraWidth">
              <div class="bg-black h-96">2</div>
            </el-col>
          </el-row>
          <!-- <p v-for="item in 50" :key="item">{{ item }}</p> -->
        </div>
      </el-main>
    </el-container>
  </el-container>
  <el-popover placement="bottom-start" trigger="click" width="70%">
    <template #reference>
      <el-button type="primary" size="large" circle class="fixed right-14 top-40 z-10">
        <template #icon>
          <i-clarity-list-line />
        </template>
      </el-button>
    </template>
    <template #default>
      <el-descriptions :border="true">
        <el-descriptions-item v-for="item in status" :key="item.title" :label="item.title">{{
          item.value
        }}</el-descriptions-item>
      </el-descriptions>
    </template>
  </el-popover>
  <el-drawer
    title="车"
    class="select-none"
    v-model="carSettingDrawerVisible"
    direction="ltr"
    size="80%"
  >
    <el-select
      v-model="currentCar"
      class="mb-5 w-full"
      placeholder="选择车辆"
      size="large"
      @visible-change="(visible: boolean) => visible && getList()"
    >
      <el-option v-for="item in carList" :key="item.id" :value="item.code">
        <span>{{ item.name }}</span
        ><span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
      </el-option>
    </el-select>
    <el-button
      class="w-full"
      @click="
        () => {
          isConfig = true
          configType = configTypes.CAMERA
        }
      "
      >配置监控</el-button
    >
    <el-divider></el-divider>
    <el-button
      class="w-full"
      @click="
        () => {
          isConfig = true
          configType = configTypes.DEVICE
        }
      "
      >配置外设</el-button
    >
    <el-divider></el-divider>
    <FrameSwitchOver />
    <el-divider></el-divider>
    <BirdAwayControl />
    <el-divider></el-divider>
    <PantiltControl />
  </el-drawer>
  <el-drawer
    title="通知"
    class="select-none"
    v-model="notificationDrawerVisible"
    direction="rtl"
    size="80%"
  >
    <div
      v-for="item in notifications"
      :key="item.time"
      class="p-5 shadow-md mb-5 font-bold relative"
      :class="notificationType(item.type)"
    >
      <div class="text-3xl absolute right-2 top-0 cursor-pointer">×</div>
      <div class="mb-5">{{ item.time }}</div>
      <div>{{ item.id }} {{ item.message }}</div>
    </div>
  </el-drawer>
</template>
