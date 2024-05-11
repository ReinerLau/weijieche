<script setup lang="ts">
import { useControlSection } from '@/composables/useControlSection'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface MenuItem {
  title: string
  event?: () => void
}

const { setMode, modeKey } = useControlSection()

const menuItems: ComputedRef<MenuItem[]> = computed(() => [
  {
    title: t('shou-dong'),
    event: () => setMode(modeKey.MANUAL)
  },
  {
    title: t('zi-zhu'),
    event: () => setMode(modeKey.AUTO)
  },
  {
    title: t('ting-zhi'),
    event: () => setMode(modeKey.STOP)
  }
])
</script>

<template>
  <el-scrollbar always>
    <el-menu mode="horizontal" :ellipsis="false">
      <div class="flex w-full">
        <el-menu-item
          v-for="item in menuItems"
          :key="item.title"
          class="flex-1 flex justify-center"
          :index="item.title"
          @click="item.event"
        >
          {{ item.title }}
        </el-menu-item>
      </div>
    </el-menu>
  </el-scrollbar>
</template>
