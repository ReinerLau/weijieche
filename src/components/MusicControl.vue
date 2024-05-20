<template>
  <div>
    <div class="grid gap-2 grid-cols-5 grid-rows-2 w-full mb-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClickMusic(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex items-center justify-between">
      <div>{{ t('xuan-ze-di') }}{{ musicNum }}{{ t('shou-yin-le') }}</div>
      <el-input-number v-model="musicNum" :min="1" @change="changeMusic" />
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

const musicNum = ref(1)
// 按钮组合
const buttonList = [
  {
    value: 2,
    content: t('bo-fang')
  },
  {
    value: 1,
    content: t('zan-ting')
  },
  {
    value: 0,
    content: t('ting-zhi')
  },
  // {
  //   value: '12',
  //   content: t('lie-biao')
  // },

  {
    value: 6,
    content: t('yin-liang-0')
  },
  {
    value: 7,
    content: t('yin-liang-1')
  },
  {
    value: 3,
    content: t('shang-yi-shou')
  },
  {
    value: 4,
    content: t('xia-yi-shou')
  },
  {
    value: 8,
    content: t('shun-xu-bo-fang')
  },
  {
    value: 9,
    content: t('dan-qu-xun-huan')
  },
  {
    value: 10,
    content: t('quan-bu-xun-huan')
  }
  // {
  //   value: '11',
  //   content: t('zhuang-tai-fan-hui')
  // }
]

async function onClickMusic(value: number) {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 4,
      param2: value,
      param3: 255,
      param4: 255
    }
    patrolingCruise(data)
  }
}

async function changeMusic() {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 4,
      param2: 5,
      param3: musicNum.value,
      param4: 255
    }
    patrolingCruise(data)
  }
}
</script>
