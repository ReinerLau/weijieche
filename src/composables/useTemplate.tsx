import { deleteTemplate, getTemplateList } from '@/api'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn,
  type FormInstance
} from 'element-plus'
import { defineComponent, ref, watch, type Ref } from 'vue'
export const useTemplate = () => {
  const dialogVisible = ref(false)
  const formRef: Ref<FormInstance | undefined> = ref()
  const formData: Ref<{ name?: string; memo?: string }> = ref({})
  const searchDialogVisible = ref(false)

  const TemplateDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      return () => (
        <ElDialog v-model={dialogVisible.value} title="模板">
          {{
            default: () => (
              <ElForm ref={formRef} label-width={100} model={formData.value}>
                <ElFormItem prop="name" label="模板名称">
                  <ElInput v-model={formData.value.name} clearable></ElInput>
                </ElFormItem>
                <ElFormItem prop="memo" label="备注">
                  <ElInput v-model={formData.value.memo} clearable></ElInput>
                </ElFormItem>
              </ElForm>
            ),
            footer: () => (
              <ElButton
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

  const TemplateSearchDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      const list: Ref<any[]> = ref([])
      const currentTemplate = ref()
      async function handleDelete(id: number) {
        await deleteTemplate(id)
        getList()
      }
      watch(searchDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      async function getList() {
        const res = await getTemplateList({ limit: 999999, rtype: 'patroling' })
        list.value = res.data || []
      }

      return () => (
        <ElDialog v-model={searchDialogVisible.value} title="模板">
          {{
            default: () => (
              <ElTable
                height={200}
                data={list.value}
                highlight-current-row
                onCurrent-change={(val) => {
                  currentTemplate.value = val
                }}
              >
                <ElTableColumn property="name" label="名称" />
                <ElTableColumn property="memo" label="备注" />
                <ElTableColumn property="createTime" label="创建时间" />
                <ElTableColumn label="操作">
                  {{
                    default: ({ row }: { row: any }) => (
                      <ElButton link onClick={() => handleDelete(row.id)}>
                        删除
                      </ElButton>
                    )
                  }}
                </ElTableColumn>
              </ElTable>
            ),
            footer: () => (
              <ElButton
                size="large"
                type="primary"
                class="w-full"
                onClick={() => emit('confirm', currentTemplate.value)}
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
    dialogVisible,
    TemplateSearchDialog,
    searchDialogVisible
  }
}
