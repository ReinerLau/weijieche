import { deleteTimingTask, getTimingTaskList } from '@/api'
import { searchDialogVisible } from '@/shared/map/patrolPath'
import { ElButton, ElDialog, ElTable, ElTableColumn } from 'element-plus'
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup() {
    const { t } = useI18n()
    // 列表数据
    const list = ref<any[]>([])

    // 删除定时任务
    async function handleDelete(id: number) {
      await deleteTimingTask(id)
      getList()
    }

    // 每次打开弹窗组件获取列表
    watch(searchDialogVisible, async (val) => {
      if (val) {
        getList()
      }
    })

    // 获取列表数据
    async function getList() {
      const res = await getTimingTaskList()
      list.value = res.data?.list || []
    }

    // 列表表头
    const columns = [
      {
        label: t('ji-qi-ren-bian-ma'),
        prop: 'code'
      },
      {
        label: t('lu-jing-mo-ban'),
        prop: 'missionId'
      },
      {
        label: t('xun-huan-tiao-jian'),
        prop: 'loopConditions'
      },
      {
        label: t('xun-huan-shi-jian'),
        prop: 'conditions'
      },
      {
        label: t('chong-dian-ren-wu'),
        prop: 'changeMission'
      },
      {
        label: t('fan-hui-jie-guo'),
        prop: 'result'
      },
      {
        label: t('xia-fa-shi-jian'),
        prop: 'time'
      }
    ]

    return () => (
      <ElDialog
        v-model={searchDialogVisible.value}
        title={t('ding-shi-ren-wu')}
        width="50vw"
        align-center
      >
        {{
          default: () => (
            <ElTable height="50vh" data={list.value} highlight-current-row>
              {columns.map((item) => (
                <ElTableColumn property={item.prop} label={item.label} />
              ))}
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
          )
        }}
      </ElDialog>
    )
  }
})
