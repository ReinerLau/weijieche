<template>
  <div>
    <div class="grid gap-2 grid-cols-5 grid-rows-2 w-full mb-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="() => onClickMusic(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-start flex-col mb-4">
      <el-button @click="onClickStatus" class="mb-2">{{ t('zhuang-tai-fan-hui') }}</el-button>
      <el-row :gutter="24" class="w-full">
        <el-col :xs="12" :sm="12">播放状态：{{ musicStatus }}</el-col>
        <el-col :xs="12" :sm="12">播放模式：{{ musicMode }}</el-col>
      </el-row>
      <el-row :gutter="24" class="w-full">
        <el-col :xs="12" :sm="12">音量值：{{ musicVolumeValue }}</el-col>
        <el-col :xs="12" :sm="12">当前播放索引：{{ musicIndex }}</el-col>
      </el-row>
      <el-row :gutter="24" class="w-full">
        <el-col :xs="24" :sm="24">当前歌名：{{ musicName }}</el-col>
      </el-row>
    </div>
    <div class="flex justify-start flex-col mb-4">
      <el-button @click="onClickMusicList" class="mb-2">{{ t('yin-le-lie-biao') }}</el-button>
      <el-row :gutter="24" class="w-full">
        <el-col :xs="24" :sm="24">当前歌曲总数：{{ musicListNumber }}</el-col>
      </el-row>
    </div>
    <div class="flex items-center justify-between">
      <div>{{ t('xuan-ze-di') }}{{ musicNum }}{{ t('shou-yin-le') }}</div>
      <el-input-number v-model="musicNum" :min="1" @change="changeMusic" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api/control'
import { musicList, musicMessage } from '@/composables/useUpperControl'
import { currentCar, haveCurrentCar } from '@/shared'
import { ref, watch } from 'vue'
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
]

const musicVolumeValue = ref('')
const musicIndex = ref('')
const musicMode = ref('')
const musicName = ref('')
const musicStatus = ref('')
watch(musicMessage, () => {
  if (musicMessage.value) {
    const { volumeValue, index, mode, name, status } = musicMessage.value
    musicVolumeValue.value = volumeValue
    musicIndex.value = index
    musicMode.value = mode
    musicName.value = name
    musicStatus.value = status
  }
})

const musicListNumber = ref(0)

watch(musicList, () => {
  if (musicList.value) {
    musicListNumber.value = musicList.value[0]['total']
  }
})

async function onClickStatus() {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 4,
      param2: 11,
      param3: 255,
      param4: 255
    }
    await patrolingCruise(data)
    if (musicMessage.value) {
      const { volumeValue, index, mode, name, status } = musicMessage.value
      musicVolumeValue.value = volumeValue
      musicIndex.value = index
      musicMode.value = mode
      musicName.value = name
      musicStatus.value = status
    }
  }
}

async function onClickMusicList() {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 4,
      param2: 12,
      param3: 255,
      param4: 255
    }
    await patrolingCruise(data)
    if (musicList.value) {
      musicListNumber.value = musicList.value[0]['total']
    }
  }
}

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
