<template>
  <div class="mb-7">{{ t('quan-jing-kong-zhi') }}</div>
  <div class="flex justify-center mb-2">
    <el-row class="w-48">
      <el-col :span="8" :offset="8">
        <el-button size="large" class="w-full" @click="onClick(keyMap.UP)">
          <Icon icon="bxs:up-arrow"></Icon>
        </el-button>
      </el-col>
      <el-row class="w-full">
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClick(keyMap.LEFT)">
            <Icon icon="bxs:left-arrow"></Icon>
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClick(keyMap.CONFIRM)">
            {{ t('que-ding') }}
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClick(keyMap.RIGHT)">
            <Icon icon="bxs:right-arrow"></Icon>
          </el-button>
        </el-col>
      </el-row>
      <el-col :span="8" :offset="8">
        <el-button size="large" class="w-full" @click="onClick(keyMap.DOWN)">
          <Icon icon="bxs:down-arrow"></Icon>
        </el-button>
      </el-col>
    </el-row>
  </div>
  <div class="grid gap-2 grid-cols-3 grid-rows-2 w-full">
    <el-button class="w-full" size="large" @click="onClick(keyMap.BATTERY)">
      {{ t('dian-yuan') }}</el-button
    >
    <el-button class="w-full" size="large" @click="onClick(keyMap.BACK)">{{
      t('fan-hui')
    }}</el-button>
    <el-button class="w-full" size="large" @click="onClick(keyMap.AV1)">{{ t('zuo') }}</el-button>
    <el-button class="w-full" size="large" @click="onClick(keyMap.AV2)">{{ t('you-0') }}</el-button>
    <el-button class="w-full" size="large" @click="onClick(keyMap.AV3)">{{ t('qian') }}</el-button>
    <el-button class="w-full" size="large" @click="onClick(keyMap.AV4)">{{ t('hou') }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api'
import { useCarStore } from '@/stores/car'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const carStore = useCarStore()

// 不同功能对应映射值
const keyMap = {
  BATTERY: 1,
  UP: 2,
  BACK: 3,
  LEFT: 4,
  CONFIRM: 5,
  RIGHT: 6,
  DOWN: 8,
  PREV: '12',
  AV1: 13,
  AV2: 14,
  AV3: 15,
  AV4: 16
}

// 开启功能
async function onClick(value: string | number) {
  const data = {
    code: carStore.currentCar,
    param1: 2,
    param2: value,
    param3: 0,
    param4: 0
  }
  patrolingCruise(data)
}
</script>
