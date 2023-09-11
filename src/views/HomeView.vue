<script setup lang="ts">
import { getCarList } from '@/api/list'
import { computed, ref, type Ref } from 'vue'
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
</script>

<template>
  <el-container class="h-full">
    <el-header class="bg-[#072232]">
      <div class="h-full flex items-center justify-between">
        <div>
          <el-button link class="!text-orange-400" @click="carSettingDrawerVisible = true">{{
            currentCarName || '未选择车辆'
          }}</el-button>
          <span>{{ currentCarStatus }}</span>
        </div>
        <el-button link class="!text-orange-400">外设操控</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside class="bg-gray-500" width="100px">Aside</el-aside>
      <el-main class="bg-zinc-400">Main</el-main>
    </el-container>
    <el-footer class="bg-red-500">Footer</el-footer>
  </el-container>
  <el-drawer
    class="!bg-[#072232] select-none"
    v-model="carSettingDrawerVisible"
    direction="ltr"
    size="20%"
  >
    <div>
      <div class="flex justify-center">
        <el-select
          v-model="currentCar"
          class="mr-2 mb-5"
          placeholder="选择车辆"
          @visible-change="(visible: boolean) => visible && getList()"
        >
          <el-option v-for="item in carList" :key="item.id" :value="item.code">
            <span>{{ item.name }}</span
            ><span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
          </el-option>
        </el-select>
        <span>{{ currentCarStatus }}</span>
      </div>
      <div
        class="text-center py-5 text-orange-400 hover:bg-orange-400 hover:text-white cursor-pointer"
      >
        配置监控
      </div>
      <div
        class="text-center py-5 text-orange-400 hover:bg-orange-400 hover:text-white cursor-pointer"
      >
        配置外设
      </div>
    </div>
  </el-drawer>
</template>
