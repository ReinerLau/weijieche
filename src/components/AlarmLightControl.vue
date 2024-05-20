<template>
  <div>
    <div class="flex justify-between items-center">
      <span>{{ t('jing-bao-deng') }}</span>
      <el-switch :model-value="alarmLight" @change="handleAlarmLight"></el-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api/control'
import { currentCar, haveCurrentCar } from '@/shared'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
// 国际化
const { t } = useI18n()
//警告灯是否开启
const alarmLight = ref(false)
function handleAlarmLight(value: boolean) {
  alarmLight.value = !alarmLight.value
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 8,
      param2: value ? 1 : 0,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
  } else {
    alarmLight.value = false
  }
}
</script>
