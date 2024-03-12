<script setup lang="ts">
import { cameraList, cameraUrl } from '@/shared'
import { useI18n } from 'vue-i18n'
import CamerPlayer from '@/components/CameraPlayer.vue'
import { ref, watch } from 'vue'
import { openStream } from '@/api'
import type { CameraPlayerInstance } from '@/types/components'

/**
 * 已选择的 rstp 地址
 */
const selectedCameraUrl = ref('')

watch(selectedCameraUrl, async () => {
  const res = await openStream(selectedCameraUrl.value)
  cameraUrl.value = res.message
})

const { t } = useI18n()

defineProps<{
  isMobile: boolean
}>()

/**
 * 重新拉流
 */
const onRefresh = () => {
  cameraRef.value?.initPlay()
}

/**
 * 播放器实例
 */
const cameraRef = ref<CameraPlayerInstance>()
</script>

<template>
  <div v-show="!isMobile && cameraList.length" class="w-1/5 p-1 bg-black">
    <div class="flex flex-col h-[40vh]">
      <div class="flex items-center mb-1">
        <el-select
          v-model="selectedCameraUrl"
          class="flex-1 mr-1"
          :placeholder="t('shi-pin-qie-huan')"
          size="large"
        >
          <el-option
            v-for="item in cameraList"
            :key="item.id"
            :label="item.name"
            :value="item.rtsp"
          />
        </el-select>
        <el-button size="large" @click="onRefresh">{{ t('shua-xin') }}</el-button>
      </div>
      <CamerPlayer ref="cameraRef" :url="cameraUrl"></CamerPlayer>
    </div>
  </div>
</template>
