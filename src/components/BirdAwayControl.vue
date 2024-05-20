<template>
  <div>
    <div class="flex justify-between items-center">
      <span>{{ t('han-hua') }}</span>
      <el-switch :model-value="talkBack" @change="handleTalkBack"></el-switch>
    </div>
    <div class="mb-7">{{ t('qu-san-kong-zhi') }}</div>
    <div class="grid gap-2 grid-cols-4 grid-rows-1 w-full">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClickBirdAway(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <!-- <div class="grid mb-4 w-full">
      <el-select
        size="large"
        v-model="audioValue"
        :placeholder="t('xuan-ze-yin-pin')"
        @change="changeAudio"
      >
        <el-option :label="t('yin-pin') + item" :value="item" v-for="item in 8" :key="item">
        </el-option>
      </el-select>
    </div> -->
  </div>
</template>

<script setup lang="ts">
// 驱鸟器控制
import { useBirdAway } from '@/composables/useBirdAway'
import { useI18n } from 'vue-i18n'

const { onClickBirdAway, handleTalkBack, talkBack } = useBirdAway()

// 国际化
const { t } = useI18n()

// 按钮组合
const buttonList = [
  {
    value: 1,
    content: t('qiang-qu-san')
  },
  {
    value: 2,
    content: t('ruo-qu-san')
  },
  {
    value: 3,
    content: t('ting-zhi')
  },
  // {
  //   value: '4',
  //   content: t('cha-xun-zhuang-tai')
  // },
  {
    value: 5,
    content: t('bo-fang-yu-yin')
  }
]
//指定音频播放
// const audioValue = ref()

// function changeAudio(val: number) {
//   if (haveCurrentCar()) {
//     playAudioById(val)
//     audioValue.value = val
//   }
// }
</script>
