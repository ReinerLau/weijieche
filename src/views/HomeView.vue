<script setup lang="ts">
import { getCarList } from '@/api/list'
import { useDark, useToggle } from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'
import { useControlSection } from '../composables/useControlSection'
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

const { AsideControl } = useControlSection()

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
        <el-button link>外设操控</el-button>
      </div>
    </el-header>
    <el-container>
      <el-header>
        <AsideControl />
      </el-header>
      <el-main id="main" class="h-0">
        <div>
          <p v-for="item in 50" :key="item">{{ item }}</p>
          <div>test</div>
        </div>
      </el-main>
    </el-container>
    <el-footer>Footer</el-footer>
  </el-container>
  <el-popover placement="top-start" trigger="click" width="80%">
    <template #reference>
      <el-button type="primary" size="large" circle class="absolute right-10 bottom-20">
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
  <el-drawer class="select-none" v-model="carSettingDrawerVisible" direction="ltr" size="20%">
    <div>
      <div class="flex justify-center">
        <el-select
          v-model="currentCar"
          class="mr-2 mb-5"
          placeholder="选择车辆"
          size="large"
          @visible-change="(visible: boolean) => visible && getList()"
        >
          <el-option v-for="item in carList" :key="item.id" :value="item.code">
            <span>{{ item.name }}</span
            ><span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
          </el-option>
        </el-select>
      </div>
      <div class="text-center py-5 hover:text-white cursor-pointer">配置监控</div>
      <div class="text-center py-5 hover:text-white cursor-pointer">配置外设</div>
    </div>
  </el-drawer>
</template>
