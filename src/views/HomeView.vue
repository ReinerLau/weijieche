<script setup lang="ts">
import { useControlSection, useNotification } from '@/composables'
import { useDark, useToggle } from '@vueuse/core'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useCarRelevant } from '../composables/useCarRelevant'
import { useConfig } from '../composables/useConfig'
import { useDetail } from '../composables/useDetail'

const currentCarName = computed(() => {
  return carList.value.find((item) => item.code === currentCar.value)?.name
})
const currentCarStatus = computed(() => {
  return carList.value.find((item) => item.code === currentCar.value)?.status === '1' ? '✅' : '🚫'
})

const { ConfigSection, isConfig, configType, configTypes } = useConfig()

const { CarRelevantDrawer, carSettingDrawerVisible, carList, currentCar } = useCarRelevant({
  isConfig,
  configType,
  configTypes
})
const isDark = useDark()
const toggleDark = useToggle(isDark)

const { TopControl } = useControlSection()

const cameraWidth = ref(8)
window.onresize = () => {
  checkIsMobile()
}
onMounted(() => {
  checkIsMobile()
})

const isMobile = ref(false)
const mainRef: Ref<HTMLElement | undefined> = ref()
function checkIsMobile() {
  if (screen.width < 1280) {
    cameraWidth.value = 24
    isMobile.value = true
    if (mainRef.value) {
      mainRef.value.style.flexDirection = 'column'
    }
  } else {
    cameraWidth.value = 12
    isMobile.value = false
    if (mainRef.value) {
      mainRef.value.style.flexDirection = 'row'
    }
  }
}
const { DetailSection, detailDrawerVisible } = useDetail({ isMobile })
const { NotificationDrawer, notificationDrawerVisible, notifications } = useNotification()
</script>

<template>
  <el-container class="h-full">
    <el-header>
      <div class="h-full flex items-center justify-between">
        <div>
          <el-button link c @click="carSettingDrawerVisible = true">{{
            currentCarName || '未选择车辆'
          }}</el-button>
          <span>{{ currentCarStatus }}</span>
        </div>
        <el-button link @click="toggleDark()">{{ isDark ? '☀️' : '🌙' }}</el-button>
        <el-button link @click="notificationDrawerVisible = true">
          <el-badge :value="notifications.length" :hidden="notifications.length === 0">
            <i-mdi-bell-outline />
          </el-badge>
        </el-button>
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
            <div class="bg-slate-500 h-full">1</div>
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
