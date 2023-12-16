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
import { onMounted, ref } from 'vue'

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

//视频流地址切换
const cameraUrl = ref('')

const { DetailSection, detailDrawerVisible } = useDetail({ isMobile }, { cameraUrl })
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
    <el-container v-show="!isConfig">
      <el-header>
        <TopControl />
      </el-header>
      <el-main>
        <div ref="mainRef" class="h-full overflow-y-auto flex">
          <div v-if="!isMobile && cameraList.length > 0" class="bg-black w-96 flex flex-col">
            <el-select
              v-model="cameraUrl"
              class="m-2"
              :placeholder="$t('shi-pin-qie-huan')"
              size="large"
            >
              <el-option
                v-for="item in cameraList"
                :key="item.id"
                :label="item.name"
                :value="item.rtsp"
              />
            </el-select>
            <!-- <div class="flex-1" v-for="item in cameraList" :key="item.id"> -->
            <CameraPlayer :url="cameraUrl" />
            <!-- </div> -->
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
