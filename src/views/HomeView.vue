<script setup lang="ts">
import { getCarList } from '@/api/list'
import { ref } from 'vue'
const carSettingDrawerVisible = ref(false)
const carList = ref([])
const currentCar = ref('')
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
        <el-button link class="!text-orange-400" @click="carSettingDrawerVisible = true"
          >未选择车辆</el-button
        >
        <el-button link class="!text-orange-400">外设操控</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside class="bg-gray-500" width="100px">Aside</el-aside>
      <el-main class="bg-zinc-400">Main</el-main>
    </el-container>
    <el-footer class="bg-red-500">Footer</el-footer>
  </el-container>
  <el-drawer class="!bg-[#072232]" v-model="carSettingDrawerVisible" direction="ltr">
    <el-select v-model="currentCar" class="m-2" placeholder="Select" size="large">
      <el-option v-for="item in carList" :key="item.code" :label="item.name" :value="item.code" />
    </el-select>
  </el-drawer>
</template>
