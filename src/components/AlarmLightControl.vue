<template>
  <div>
    <el-row :gutter="24" class="w-full">
      <el-col :xs="24" :sm="24">
        <div class="flex justify-between items-center">
          <span>{{ t('jing-bao-deng') }}</span>
          <el-switch :model-value="alarmLight" @change="handleAlarmLight"></el-switch></div></el-col
    ></el-row>
  </div>
</template>

<script setup lang="ts">
import { controlAlarmLight } from '@/api/control'
import { currentCar } from '@/shared'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
// 国际化
const { t } = useI18n()
//警告灯是否开启
const alarmLight = ref(false)
async function handleAlarmLight(value: boolean) {
  alarmLight.value = !alarmLight.value
  const data = {
    code: currentCar.value,
    type: value ? 1 : 0
  }
  await controlAlarmLight(data)
}
</script>
