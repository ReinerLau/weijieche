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

// 模板相关
export const useTemplate = () => {
  // 国际化
  // https://vue-i18n.intlify.dev/guide/advanced/composition.html#basic-usage
  const { t } = useI18n()

  // 弹窗是否可见
  const dialogVisible = ref(false)

  // 新建模板的表单数据
  const formData: Ref<{ name?: string; memo?: string }> = ref({})

  // 搜索模板弹窗是否可见
  const searchDialogVisible = ref(false)

  // 警告弹窗是否可见
  const alarmDialogVisible = ref(false)

  // 新建模板弹窗组件
  // https://cn.vuejs.org/guide/typescript/composition-api.html#without-script-setup
  const TemplateDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      return () => (
        <ElDialog v-model={dialogVisible.value} title={t('mo-ban')}>
          {{
            default: () => (
              <ElForm label-width={250} model={formData.value}>
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

  // 搜索模板弹窗组件
  // https://cn.vuejs.org/guide/typescript/composition-api.html#without-script-setup
  const TemplateSearchDialog = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      // 列表数据
      const list: Ref<any[]> = ref([])

      // 当前选择的模板
      const currentTemplate = ref()

      // 删除模板
      async function handleDelete(id: number) {
        await deleteTemplate(id)
        getList()
      }

      // 每次打开搜索弹窗重新获取数据
      watch(searchDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      // 获取列表数据
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

  //警报弹窗
  const TemplateAlarmDialog = defineComponent({
    emits: ['confirm'],
    setup() {
      // 每次打开搜索弹窗重新获取数据
      watch(alarmDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })

      // 获取图片数据
      async function getList() {}

      return () => (
        <ElDialog v-model={alarmDialogVisible.value} title="警告弹窗" width="80%"></ElDialog>
      )
    }
  })
  return {
    TemplateDialog,
    dialogVisible,
    TemplateSearchDialog,
    searchDialogVisible,
    TemplateAlarmDialog,
    alarmDialogVisible
  }
}
