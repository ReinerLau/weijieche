<template>
  <div>
    <div class="flex justify-between items-center">
      <span>{{ t('han-hua') }}</span>
      <el-switch :model-value="talkBack" @change="handleTalkBack"></el-switch>
    </div>
    <div class="mb-7">{{ t('qu-san-kong-zhi') }}</div>
    <div class="grid gap-2 grid-cols-4 grid-rows-1 w-full mb-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClickBirdAway(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-start flex-col">
      <el-button @click="onClickBirdStatus" class="mb-2">{{ t('cha-xun-zhuang-tai') }}</el-button>
      <div>{{ birStatus }}</div>
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
import { useBirdAway } from '@/composables/useBirdAway'
import { birStatus } from '@/composables/useUpperControl'
import { useI18n } from 'vue-i18n'
const { onClickBirdAway, handleTalkBack, talkBack, onClickBirdStatus } = useBirdAway()

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
  {
    value: 5,
    content: t('bo-fang-yu-yin')
  }
]
</script>
