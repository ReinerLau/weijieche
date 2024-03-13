<script setup lang="ts">
import {
  handleConfirmPointCarConfig,
  pointConfigDrawerVisible,
  pointSpeed,
  pointCoordinates
} from '@/shared/map/pointConfig'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * 确定修改速度
 */
const handleConfirm = () => {
  handleConfirmPointCarConfig(pointSpeed.value)
  pointConfigDrawerVisible.value = false
}
</script>

<template>
  <el-drawer
    :title="t('lu-xian-dian-gong-neng-she-zhi')"
    class="select-none"
    v-model="pointConfigDrawerVisible"
    size="50%"
  >
    <template #default>
      <el-form :label-width="100">
        <el-form-item :label="t('lu-xian-dian-zuo-biao')">
          <el-input v-model="pointCoordinates" disabled />
        </el-form-item>
        <el-form-item :label="t('che-liang-su-du-ms')">
          <el-input v-model="pointSpeed" clearable />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button size="large" type="primary" class="w-full" @click="handleConfirm">{{
        t('que-ding')
      }}</el-button>
    </template>
  </el-drawer>
</template>
