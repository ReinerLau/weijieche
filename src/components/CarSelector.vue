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
      <span>{{ item.status === '1' ? '✅' : '🚫' }}</span>
    </ElOption>
  </ElSelect>
</template>

<script setup lang="ts">
import { getCarList } from '@/api/list'
import { carList, currentCar } from '@/shared'
import { ElOption, ElSelect } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

async function getList() {
  const { data } = await getCarList('patroling')
  carList.value = data || []
}
</script>
