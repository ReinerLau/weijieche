<template>
  <div>
    <div class="mb-7">{{ t('dong-zuo-sao-miao') }}</div>
    <div class="flex items-center justify-between mb-7">
      <div>{{ t('ting-liu-shi-jian-s') }}</div>
      <el-input-number v-model="stopTime" :min="0" />
    </div>
    <div class="grid gap-2 grid-cols-2 grid-rows-1 w-full">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClick(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api/control'
import { horizonAngle, verticalAngle } from '@/composables/usePantilt'
import { useCarStore } from '@/stores/car'
import { ElInputNumber } from 'element-plus'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const carStore = useCarStore()

// 按钮组合
const buttonList = [
  {
    value: 1,
    content: t('kai-qi')
  },
  {
    value: 2,
    content: t('qiang-zhi-jie-shu')
  }
]

const stopTime = ref(0)
async function onClick(value: number) {
  if (value === 1) {
    let array: any = []
    array.push(horizonAngle.value)
    array.push(verticalAngle.value)
    array.push(stopTime.value)
    const data = {
      code: carStore.currentCar,
      param1: 9,
      param2: value,
      param3: array.join(','),
      param4: 255
    }
    patrolingCruise(data)
  } else if (value === 2) {
    const data = {
      code: carStore.currentCar,
      param1: 9,
      param2: value,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
  }
}
</script>
