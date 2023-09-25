import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, type FormInstance } from 'element-plus'
import { defineComponent, ref, type Ref } from 'vue'
export const useTemplate = () => {
  const dialogVisible = ref(false)
  const loading = ref(false)
  const formRef: Ref<FormInstance | undefined> = ref()
  const formData: Ref<{ name?: string; memo?: string }> = ref({})
  async function handleSaveTemplate() {
    dialogVisible.value = true
  }

  const TemplateDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      return (
        <ElDialog v-model={dialogVisible.value} title="模板">
          {{
            default: () => (
              <ElForm ref={formRef} label-width={100} model={formData.value}>
                <ElFormItem prop="name" label="模板名称">
                  <ElInput v-model={formData.value.name} clearable></ElInput>
                </ElFormItem>
                <ElFormItem prop="memo" label="任务描述">
                  <ElInput v-model={formData.value.memo} clearable></ElInput>
                </ElFormItem>
              </ElForm>
            ),
            footer: () => (
              <ElButton
                loading={loading.value}
                size="large"
                type="primary"
                class="w-full"
                onClick={() => emit('confirm', formData.value)}
              >
                确定
              </ElButton>
            )
          }}
        </ElDialog>
      )
    }
  })
  return {
    TemplateDialog,
    handleSaveTemplate
  }
}
