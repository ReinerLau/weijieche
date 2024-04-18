<script setup lang="ts">
import {
  closeTemplate,
  formData,
  templateDialogVisible,
  type FormData
} from '@/shared/map/template'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  confirm: [FormData]
}>()

const onClick = () => {
  emit('confirm', formData.value)
}

watch(templateDialogVisible, () => {
  // formRef.value?.resetFields()
  formData.value = { name: '', memo: '' }
})
</script>

<template>
  <ElDialog
    v-model="templateDialogVisible"
    :title="t('mo-ban')"
    width="50vw"
    align-center
    :before-close="closeTemplate"
  >
    <template #default>
      <ElForm :label-width="100" :model="formData">
        <ElFormItem prop="name" :label="t('mo-ban-ming-cheng')">
          <ElInput v-model="formData.name" clearable />
        </ElFormItem>
        <ElFormItem prop="memo" :label="t('bei-zhu')">
          <ElInput v-model="formData.memo" clearable />
        </ElFormItem>
      </ElForm>
    </template>
    <template #footer>
      <ElButton size="large" type="primary" class="w-full" @click="onClick">{{
        t('que-ding')
      }}</ElButton>
    </template>
  </ElDialog>
</template>
