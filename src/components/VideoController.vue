<script setup lang="ts">
import { cameraList, cameraUrl } from '@/shared'
import { useI18n } from 'vue-i18n'
import CamerPlayer from '@/components/CameraPlayer.vue'
import { ref, watch } from 'vue'
import { openStream } from '@/api'

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
</script>

<template>
  <div v-show="!isMobile && cameraList.length" class="w-1/5 bg-[#0c2d46]">
    <div class="bg-black flex flex-col h-[40vh]">
      <el-select
        v-model="selectedCameraUrl"
        class="m-2"
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
      <CamerPlayer :url="cameraUrl"></CamerPlayer>
    </div>
  </div>
</template>
