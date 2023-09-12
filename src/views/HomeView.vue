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
const frontLight = ref(false)
const { Template, Auto } = useControlSection()
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
        <div>
          <el-button link @click="toggleDark()">{{ isDark ? '☀️' : '🌙' }}</el-button>
          <el-button link>外设操控</el-button>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="2">
          <Template></Template>
          <Auto></Auto>
          <el-menu-item index="2">
            <div class="flex justify-between items-center w-full">
              <span>前灯</span>
              <el-switch v-model="frontLight" />
            </div>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="bg-zinc-400">Main</el-main>
    </el-container>
    <el-footer class="bg-red-500">Footer</el-footer>
  </el-container>
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
