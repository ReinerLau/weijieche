<template>
  <div>
    <div class="text-white mb-7">驱鸟器控制</div>
    <div class="grid gap-2 grid-cols-5 grid-rows-1 w-full h-14 mr-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-center items-center">
      <span class="text-white mr-5">音量</span>
      <el-slider class="flex-1" :step="1" :min="1" :max="30" :show-input-controls="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
const buttonList = [
  {
    value: '01',
    content: '驱鸟'
  },
  {
    value: '02',
    content: '驱人'
  },
  {
    value: '03',
    content: '暂停'
  },
  {
    value: '05',
    content: '使能'
  },
  {
    value: '06',
    content: '失能'
  }
]
</script>
