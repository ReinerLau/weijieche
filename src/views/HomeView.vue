<script setup lang="ts">
import {
  useCarRelevant,
  useConfig,
  useControlSection,
  useDetail,
  useInternational,
  useMap,
  useNotification,
  useResponsive,
  useTheme,
  useHistory,
  useLogout
} from '@/composables'

import { onMounted, ref } from 'vue'

const { ConfigSection, isConfig, configType, configTypes } = useConfig()

const { CarRelevantDrawer, CarRelevantController } = useCarRelevant({
  isConfig,
  configType,
  configTypes
})

const { TopControl } = useControlSection()
const { checkIsMobile, mainRef, isMobile } = useResponsive()

window.onresize = () => {
  checkIsMobile()
}
onMounted(() => {
  checkIsMobile()
})

// 视频流地址切换
const cameraUrl = ref('')
const { DetailSection, detailDrawerVisible } = useDetail({ isMobile }, { cameraUrl })
const { HistoryController } = useHistory()
const { LogoutController } = useLogout()
const { NotificationDrawer, NotificationController } = useNotification()
const { ThemeController } = useTheme()
const { InternationalController } = useInternational()
const { MapContainer } = useMap()

function handleCameraUrl(url: any) {
  cameraUrl.value = url
}
</script>

<template>
  <el-container id="container" class="h-full">
    <el-header>
      <div class="h-full flex items-center justify-between">
        <CarRelevantController />
        <div class="flex items-center">
          <ThemeController />
          <InternationalController />
          <NotificationController />
          <HistoryController />
          <LogoutController />
        </div>
      </div>
    </el-header>
    <el-main v-if="isConfig" id="main" class="h-0">
      <ConfigSection />
    </el-main>
    <el-container v-show="!isConfig">
      <el-header>
        <TopControl />
      </el-header>
      <el-main>
        <div ref="mainRef" class="h-full overflow-y-auto flex">
          <div class="h-full flex-1 flex flex-col">
            <div class="h-full">
              <MapContainer @confirm="handleCameraUrl" :isMobile="isMobile" />
            </div>
            <el-button class="w-full" size="large" @click="detailDrawerVisible = true">
              <i-mdi-arrow-drop-up class="text-3xl" />
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
  <DetailSection />
  <CarRelevantDrawer />
  <NotificationDrawer />
</template>

<style scoped lang="scss">
.dark #container {
  background-color: #072232;
}
:deep(.maptalks-attribution) {
  display: none !important;
}
</style>
