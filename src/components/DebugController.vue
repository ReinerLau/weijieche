<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  /**
   * 模式切换事件
   */
  change: [val: boolean]
  /**
   * 坐标跳转事件
   */
  jump: [mouseCoordinate: { x: number; y: number }]
}>()

const { t } = useI18n()

/**
 * 调试模式开启状态
 */
const debugMode = ref(false)

/**
 * 要跳转的坐标
 */
const mouseCoordinate = reactive({
  x: 0,
  y: 0
})

/**
 * 开关切换
 */
const onChangeMode = (val: string | number | boolean) => {
  if (typeof val === 'boolean') {
    emit('change', val)
  }
}

/**
 * 跳装坐标
 */
const onJump = () => {
  emit('jump', mouseCoordinate)
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
      <el-button type="primary" @click="onJump">确定</el-button>
    </div>
  </div>
</template>
