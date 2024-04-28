<template>
  <div>
    <div class="mb-7">{{ t('qu-niao-qi-kong-zhi') }}</div>
    <div class="grid gap-2 grid-cols-3 grid-rows-2 w-full mb-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClick(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="grid mb-4 w-full">
      <el-select
        size="large"
        v-model="audioValue"
        :placeholder="t('xuan-ze-yin-pin')"
        @change="changeAudio"
      >
        <el-option :label="t('yin-pin') + item" :value="item" v-for="item in 8" :key="item">
        </el-option>
      </el-select>
    </div>
    <div class="flex justify-between items-center">
      <span>{{ t('ji-guang-fa-san-qi') }}</span>
      <el-switch :model-value="disperseMode" @change="controlLaser"></el-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
// 驱鸟器控制
import { playAudioById } from '@/api'
import { useBirdAway } from '@/composables/useBirdAway'
import { haveCurrentCar } from '@/shared'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { controlLaser, disperseMode, onClick } = useBirdAway()

// 国际化
const { t } = useI18n()

// 按钮组合
const buttonList = [
  {
    value: '9',
    content: t('qu-niao')
  },
  {
    value: '10',
    content: t('qu-ren')
  },
  {
    value: '08',
    content: t('jie-shu-bo-fang')
  },
  {
    value: '05',
    content: t('shi-neng')
  },
  {
    value: '06',
    content: t('shi-neng-0')
  },
  {
    value: '07',
    content: t('dui-jiang')
  }
]

const audioValue = ref()

function changeAudio(val: number) {
  if (haveCurrentCar()) {
    playAudioById(val)
    audioValue.value = val
  }
}
</script>
