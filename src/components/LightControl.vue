<template>
  <div>
    <div class="mb-7">{{ t('deng-guang-kong-zhi') }}</div>
    <div class="grid gap-2 grid-cols-3 grid-rows-2 w-full mb-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClickLight(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-between items-center mb-4">
      <span>{{ t('ji-guang-zhi-shi') }}</span>
      <el-switch :model-value="disperseMode" @change="controlLaser"></el-switch>
    </div>
    <div class="flex justify-start flex-col">
      <el-button @click="onClickLightStatus" class="mb-2">{{ t('cha-xun-zhuang-tai') }}</el-button>
      <div>{{ lightStatus }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api/control'
import { useBirdAway } from '@/composables/useBirdAway'
import { lightStatus } from '@/composables/useUpperControl'
import { useCarStore } from '@/stores/car'
import { useI18n } from 'vue-i18n'
const { disperseMode, controlLaser } = useBirdAway()

const { t } = useI18n()
const carStore = useCarStore()

// 按钮组合
const buttonList = [
  {
    value: 1,
    content: t('ju-guang-chang-liang')
  },
  {
    value: 2,
    content: t('ju-bao')
  },
  {
    value: 3,
    content: t('fan-chang')
  },
  {
    value: 4,
    content: t('fan-bao')
  },
  {
    value: 5,
    content: t('guan-deng')
  },
  {
    value: 8,
    content: t('quan-guan')
  }
  // {
  //   param: 4,
  //   value: 4,
  //   content: t('cha-xun')
  // }
]

async function onClickLight(value: number) {
  const data = {
    code: carStore.currentCar,
    param1: 7,
    param2: 1,
    param3: value,
    param4: 255
  }
  patrolingCruise(data)
}

async function onClickLightStatus() {
  const data = {
    code: carStore.currentCar,
    param1: 7,
    param2: 4,
    param3: 4,
    param4: 255
  }
  patrolingCruise(data)
}
</script>
