<script setup lang="ts">
import { baseLayer, jumpToCoordinate } from '@/shared/map/base'
import { mouseCoordinate } from '@/shared/map/debug'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * 调试模式开启状态
 */
const debugMode = ref(false)

/**
 * 开启调试模式显示网格
 * @param val 调试模式开启状态
 */
const onChangeMode = (val: string | number | boolean) => {
  if (typeof val === 'boolean') {
    baseLayer.config('debug', val)
  }
}

/**
 * 跳装坐标
 */
const onJump = () => {
  jumpToCoordinate(mouseCoordinate.x, mouseCoordinate.y)
}
</script>

<template>
  <div class="text-right">
    <el-switch
      v-model="debugMode"
      :active-text="t('tiao-shi')"
      :inactive-text="t('zheng-chang')"
      @change="onChangeMode"
    />
    <div v-if="debugMode" class="flex">
      <el-input type="number" v-model="mouseCoordinate.x" class="mr-1"></el-input>
      <el-input type="number" v-model="mouseCoordinate.y" class="mr-1"></el-input>
      <el-button type="primary" @click="onJump">{{ t('que-ding') }}</el-button>
    </div>
  </div>
</template>
