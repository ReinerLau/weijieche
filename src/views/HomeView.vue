<script setup lang="ts">
import { getCameraListByCode } from '@/api'
import MapContainer from '@/components/MapContainer'
import TopControl from '@/components/TopControl.vue'
import {
  useCarRelevant,
  useConfig,
  useDetail,
  useHistory,
  useInternational,
  useLogout,
  useNotification,
  useResponsive,
  useTheme
} from '@/composables'
import { cameraList, currentCar } from '@/shared'
import { onMounted, watch } from 'vue'

const { ConfigSection, isConfig, configType, configTypes } = useConfig()

const { CarRelevantDrawer, CarRelevantController } = useCarRelevant({
  isConfig,
  configType,
  configTypes
})

const { checkIsMobile, mainRef, isMobile } = useResponsive()

window.onresize = () => {
  checkIsMobile()
}
onMounted(() => {
  checkIsMobile()
})

// 视频流地址切换
const { DetailSection, detailDrawerVisible } = useDetail({ isMobile })
const { HistoryController } = useHistory()
const { LogoutController } = useLogout()
const { NotificationDrawer, NotificationController } = useNotification()
const { ThemeController } = useTheme()
const { InternationalController } = useInternational()

// 每次切换车辆都要重新获取对应的摄像头数据
watch(currentCar, async () => {
  const res = await getCameraListByCode(currentCar.value, 'patroling')
  cameraList.value = res.data
})
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
              <MapContainer :isMobile="isMobile" />
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
