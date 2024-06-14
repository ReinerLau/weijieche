<template>
  <el-dialog
    :model-value="visible"
    :show-close="false"
    :close-on-click-modal="false"
    title="选择车辆"
  >
    <template #default>
      <ElSelect
        :model-value="carStore.currentCar"
        :placeholder="t('xuan-ze-che-liang')"
        class="w-full"
        @change="changeCar"
        @visibleChange="visibleChange"
      >
        <ElOption v-for="item in carStore.carList" :key="item.id" :value="item.code">
          <span>{{ item.name }}</span>
          <span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
        </ElOption>
      </ElSelect>
    </template>
    <template #footer>
      <el-button type="primary" @click="confirmIt">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useCarDialog } from '@/composables/useCarDialog'
import { useCarSelector } from '@/composables/useCarSelector'
import { useCarStore } from '@/stores/car'
import { useI18n } from 'vue-i18n'

const { visible, confirmIt } = useCarDialog()
const carStore = useCarStore()
const { changeCar, visibleChange } = useCarSelector()
const { t } = useI18n()
</script>
