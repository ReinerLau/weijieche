<template>
  <ElSelect
    :model-value="carStore.currentCar"
    :placeholder="t('xuan-ze-che-liang')"
    size="small"
    @visibleChange="visibleChange"
    class="mr-2"
    @change="changeCar"
  >
    <ElOption v-for="item in carList" :key="item.id" :value="item.code">
      <span>{{ item.name }}</span>
      <span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
    </ElOption>
  </ElSelect>
</template>

<script setup lang="ts">
import { useCarSelector } from '@/composables/useCarSelector'
import { carList } from '@/shared'
import { useCarStore } from '@/stores/car'
import { ElOption, ElSelect } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { changeCar, visibleChange } = useCarSelector()
const carStore = useCarStore()

const { t } = useI18n()
</script>
