<script setup lang="ts">
import { templateDialogVisible, closeTemplate } from '@/shared/map/template'
import type { FormInstance } from 'element-plus'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface FormData {
  name?: string
  memo?: string
}

const { t } = useI18n()
// 新建模板的表单数据
const formData = ref<FormData>({ name: '', memo: '' })

const emit = defineEmits<{
  confirm: [FormData]
}>()

const onClick = () => {
  emit('confirm', formData.value)
}

const formRef = ref<FormInstance>()

watch(templateDialogVisible, () => {
  formRef.value?.resetFields()
  formData.value = {}
})
</script>

<template>
  <el-dialog
    v-model="templateDialogVisible"
    :title="t('mo-ban')"
    width="50vw"
    align-center
    :before-close="closeTemplate"
  >
    <template #default>
      <el-form ref="formRef" :label-width="100" :model="formData">
        <el-form-item prop="name" :label="t('mo-ban-ming-cheng')">
          <el-input v-model="formData.name" clearable />
        </el-form-item>
        <el-form-item prop="name" :label="t('bei-zhu')">
          <el-input v-model="formData.memo" clearable />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button size="large" type="primary" class="w-full" @click="onClick">{{
        t('que-ding')
      }}</el-button>
    </template>
  </el-dialog>
</template>
