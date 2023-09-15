<script setup lang="ts">
import {
  useCarRelevant,
  useConfig,
  useControlSection,
  useDetail,
  useInternational,
  useNotification,
  useResponsive,
  useTheme
} from '@/composables'

import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

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
const { locale } = useI18n()
</script>

<template>
  <el-container class="h-full">
    <el-header>
      <div class="h-full flex items-center justify-between">
        <CarRelevantController />
        <div class="flex items-center">
          <div>{{ locale }}</div>
          <NotificationController />
          <ThemeController />
          <InternationalController class="ml-2" />
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
          <div v-if="!isMobile" class="bg-black w-96 flex flex-col">
            <div class="flex-1">1</div>
            <div class="flex-1">2</div>
            <div class="flex-1">3</div>
          </div>
          <div class="h-full flex-1 flex flex-col">
            <div class="bg-slate-500 h-full">测试</div>
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
