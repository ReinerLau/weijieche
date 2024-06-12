<script setup lang="ts">
import { templatePathPoints } from '@/shared/map/path'
import {
  currentSelectedPointIndex,
  handleConfirmPointCarConfig,
  pointConfigDrawerVisible,
  pointCoordinates,
  pointSpeed
} from '@/shared/map/pointConfig'
import { ElButton, ElDrawer, ElForm, ElFormItem, ElInput, ElInputNumber } from 'element-plus'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

/**
 * 确定修改速度
 */
const handleConfirm = () => {
  handleConfirmPointCarConfig(pointSpeed.value)
  pointConfigDrawerVisible.value = false
  if (templatePathPoints.value) {
    templatePathPoints.value[currentSelectedPointIndex.value].updateSymbol({
      textName: pointSpeed.value
    })
  }
}
</script>

<template>
  <ElDrawer
    :title="t('lu-xian-dian-gong-neng-she-zhi')"
    class="select-none"
    v-model="pointConfigDrawerVisible"
    size="50%"
  >
    <template #default>
      <ElForm :label-width="100">
        <ElFormItem :label="t('lu-xian-dian-zuo-biao')">
          <ElInput v-model="pointCoordinates" disabled />
        </ElFormItem>
        <ElFormItem :label="t('che-liang-su-du-ms')">
          <ElInputNumber :min="0" v-model="pointSpeed" clearable />
        </ElFormItem>
      </ElForm>
    </template>
    <template #footer>
      <ElButton size="large" type="primary" class="w-full" @click="handleConfirm">{{
        t('que-ding')
      }}</ElButton>
    </template>
  </ElDrawer>
</template>
