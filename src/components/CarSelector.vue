<template>
  <ElSelect
    v-model="currentCar"
    :placeholder="t('xuan-ze-che-liang')"
    size="small"
    @visibleChange="(visible: boolean) => visible && getList()"
    class="mr-2"
  >
    <ElOption v-for="item in carList" :key="item.id" :value="item.code">
      <span>{{ item.name }}</span>
      <span>{{ item.status === 1 ? '✅' : '🚫' }}</span>
    </ElOption>
  </ElSelect>
</template>

<script setup lang="ts">
import { ElSelect, ElOption } from 'element-plus'
import { carList, currentCar } from '@/shared'
import { useI18n } from 'vue-i18n'
import { getCarList } from '@/api/list'

const { t } = useI18n()

async function getList() {
  const { data } = await getCarList('patroling')
  carList.value = data || []
}
</script>
