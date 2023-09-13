<template>
  <div>
    <div class="text-white mb-7">云台控制</div>
    <!-- <div class="grid gap-2 grid-cols-3 grid-rows-3 w-48 h-48 mr-4">
      <template v-for="item in rightButtonList" :key="item.value">
        <div
          v-if="item.value"
          :class="[
            'bg-[#33434b]',
            'border',
            'border-solid',
            'border-[#627075]',
            'flex',
            'justify-center',
            'items-center',
            'cursor-pointer',
            'h-full',
            'active:bg-sky-700',
            'focus:bg-sky-500'
          ]"
        >
          <SvgIcon class="w-5 h-5" :name="item.icon"></SvgIcon>
        </div>
        <div v-else class="h-full" />
      </template>
    </div> -->
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex text-white items-center">
        <span class="w-24">水平角度</span>
        <el-slider class="flex-1" :step="1" :min="-180" :max="180" :show-input-controls="false" />
      </div>
      <div class="flex text-white items-center">
        <span class="w-24">垂直角度</span>
        <el-slider class="flex-1" :step="1" :min="-180" :max="180" :show-input-controls="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const rightButtonList = [
  {
    icon: 'patroling-dir_up_lf',
    value: null
  },
  {
    icon: 'patroling-dir_up',
    value: '08'
  },
  {
    icon: 'patroling-dir_up_rt',
    value: null
  },
  {
    icon: 'patroling-dir_c_lf',
    value: '04'
  },
  {
    icon: 'patroling-full_switch',
    value: '255'
  },
  {
    icon: 'patroling-dir_c_rt',
    value: '02'
  },
  {
    icon: 'patroling-dir_d_lf',
    value: null
  },
  {
    icon: 'patroling-dir_down',
    value: '16'
  },
  {
    icon: 'patroling-dir_d_rt',
    value: null
  }
]
</script>
