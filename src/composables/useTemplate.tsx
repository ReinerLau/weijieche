import { deleteTemplate, getTemplatePathList } from '@/api'
import { templateSearchDialogVisible } from '@/shared/map/template'
import {
  ElButton,
  ElDialog,
  ElImage,
  ElInput,
  ElPagination,
  ElScrollbar,
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

  // 警告弹窗是否可见
  const alarmDialogVisible = ref(false)

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
      watch(templateSearchDialogVisible, async (val) => {
        if (val) {
          getList()
        }
      })
      const queryFields = [
        {
          prop: 'name',
          title: t('ren-wu-ming-cheng')
        },
        {
          prop: 'memo',
          title: t('bei-zhu')
        }
      ]

      const initialParams = {
        limit: 10,
        page: 1,
        rtype: 'patroling'
      }

      const params: Record<string, any> = ref(Object.assign({}, initialParams))

      const total = ref(0)

      // 获取列表数据
      async function getList() {
        const res = await getTemplatePathList(params.value)
        list.value = res.data.list || []
        total.value = res.data ? res.data.total : 0
      }

      function handleQuery() {
        getList()
      }

      function handleReset() {
        params.value = Object.assign({}, initialParams)
        getList()
      }

      return () => (
        <ElDialog
          v-model={templateSearchDialogVisible.value}
          title={t('mo-ban')}
          width="50vw"
          align-center
        >
          {{
            header: () => (
              <div class=" flex flex-col h">
                <span class="mb-3">{t('lu-xian-mo-ban')}</span>
                <ElScrollbar>
                  <div class="flex justify-between">
                    {queryFields.map((item) => (
                      <div>
                        <ElInput
                          v-model={params.value[item.prop]}
                          placeholder={item.title}
                          clearable
                        ></ElInput>
                      </div>
                    ))}
                  </div>
                </ElScrollbar>
                <div class="flex pt-2">
                  <ElButton type="primary" class="mr-2" onClick={handleQuery}>
                    {t('cha-xun')}
                  </ElButton>
                  <ElButton type="info" onClick={handleReset}>
                    {t('zhong-zhi')}
                  </ElButton>
                </div>
              </div>
            ),
            default: () => (
              <div class="flex flex-col ">
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
                <div class="flex justify-end mt-2">
                  <ElScrollbar class="mt-2">
                    <ElPagination
                      layout="sizes, prev, pager, next"
                      total={total.value}
                      v-model:current-page={params.value.page}
                      v-model:page-size={params.value.limit}
                      page-sizes={[10, 20, 50, 100, 200, 500]}
                      onSize-change={getList}
                      onCurrent-change={getList}
                    />
                  </ElScrollbar>
                </div>
              </div>
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

  async function handleAlarm() {
    alarmDialogVisible.value = false
  }
  const TemplateAlarmDialog = defineComponent({
    emits: ['confirm'],
    props: {
      wsdata: {
        type: Object,
        required: true
      }
    },
    setup(props) {
      const srcList: string[] = []
      const imgUrl = ref<string>('')
      watch(props, (val) => {
        imgUrl.value = ''
        srcList.length = 0
        imgUrl.value = val.wsdata.picPath
        srcList.push(val.wsdata.picPath)
      })

      return () => (
        <ElDialog
          v-model={alarmDialogVisible.value}
          title={props.wsdata.message}
          width="500"
          class=" !mr-[1vw]"
          // align-center
          draggable={true}
        >
          {{
            default: () => (
              <div class="flex items-center justify-around ">
                <ElImage
                  class="w-28 h-28"
                  src={imgUrl.value}
                  fit="cover"
                  zoom-rate={1.2}
                  max-scale={7}
                  min-scale={0.2}
                  preview-src-list={srcList}
                  initial-index={0}
                />
              </div>
            ),
            footer: () => (
              <div class="flex justify-between">
                <ElButton size="large" class="w-full" onClick={handleAlarm}>
                  {t('bu-zuo-chu-li')}
                </ElButton>
                <ElButton
                  size="large"
                  type="primary"
                  class="w-full"
                  onClick={() => (alarmDialogVisible.value = false)}
                >
                  {t('shou-dong-chu-li')}
                </ElButton>
              </div>
            )
          }}
        </ElDialog>
      )
    }
  })
  return {
    TemplateSearchDialog,
    TemplateAlarmDialog,
    alarmDialogVisible,
    handleAlarm
  }
}
