import { deleteTemplate, getTemplateList } from '@/api'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { defineComponent, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
export const useTemplate = () => {
  const { t } = useI18n()
  const dialogVisible = ref(false)
  const formData: Ref<{ name?: string; memo?: string }> = ref({})
  const searchDialogVisible = ref(false)

  const TemplateDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      return () => (
        <ElDialog v-model={dialogVisible.value} title={t('mo-ban')}>
          {{
            default: () => (
              <ElForm label-width={100} model={formData.value}>
                <ElFormItem prop="name" label={t('mo-ban-ming-cheng')}>
                  <ElInput v-model={formData.value.name} clearable></ElInput>
                </ElFormItem>
                <ElFormItem prop="memo" label={t('bei-zhu')}>
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
                {t('que-ding')}
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
        <ElDialog v-model={searchDialogVisible.value} title={t('mo-ban')} width="80%">
          {{
            default: () => (
              <ElTable
                height="50vh"
                data={list.value}
                highlight-current-row
                onCurrent-change={(val) => {
                  currentTemplate.value = val
                }}
              >
                <ElTableColumn property="name" label={t('ming-cheng')} />
                <ElTableColumn property="memo" label={t('bei-zhu')} />
                <ElTableColumn property="createTime" label={t('chuang-jian-shi-jian')} />
                <ElTableColumn label={t('cao-zuo')}>
                  {{
                    default: ({ row }: { row: any }) => (
                      <ElButton link onClick={() => handleDelete(row.id)}>
                        {t('shan-chu')}
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
                {t('que-ding')}
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
