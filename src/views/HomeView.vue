<script setup lang="ts">
import CameraPlayer from '@/components/CameraPlayer.vue'
import {
  useCarRelevant,
  useConfig,
  useControlSection,
  useDetail,
  useInternational,
  useMap,
  useNotification,
  useResponsive,
  useTheme
} from '@/composables'

import { cameraList } from '@/shared'
import { onMounted } from 'vue'

const { ConfigSection, isConfig, configType, configTypes } = useConfig()

const { CarRelevantDrawer, CarRelevantController } = useCarRelevant({
  isConfig,
  configType,
  configTypes
})

const { TopControl } = useControlSection()
const { checkIsMobile, isMobile, mainRef } = useResponsive()

window.onresize = () => {
  checkIsMobile()
}
onMounted(() => {
  checkIsMobile()
})

const { DetailSection, detailDrawerVisible } = useDetail({ isMobile })
const { NotificationDrawer, NotificationController } = useNotification()
const { ThemeController } = useTheme()
const { InternationalController } = useInternational()
const { MapContainer } = useMap()
</script>

<template>
  <el-container id="container" class="h-full">
    <el-header>
      <div class="h-full flex items-center justify-between">
        <CarRelevantController />
        <div class="flex items-center">
          <NotificationController />
          <ThemeController class="ml-3" />
          <InternationalController class="ml-3" />
        </div>
      </div>
    </el-header>
    <el-main v-if="isConfig" id="main" class="h-0">
      <ConfigSection />
    </el-main>
    <el-container v-else>
      <el-header>
        <TopControl />
      </el-header>
      <el-main>
        <div ref="mainRef" class="h-[calc(100vh-160px)] overflow-y-auto flex">
          <div v-if="!isMobile && cameraList.length > 0" class="bg-black w-96 flex flex-col">
            <div class="flex-1" v-for="item in cameraList" :key="item.id">
              <CameraPlayer :url="item.rtsp" />
            </div>
          </div>
          <div class="h-full flex-1 flex flex-col">
            <div class="h-full">
              <MapContainer />
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
</style>
