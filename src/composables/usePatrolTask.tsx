import { ElCard, ElTable, ElTableColumn } from 'element-plus'
import { defineComponent, ref, type Ref } from 'vue'

export const usePatrolTask = () => {
  const PatrolTaskTable = defineComponent({
    setup() {
      const list: Ref<any[]> = ref([
        {
          name: 'a',
          id: '1'
        },
        {
          name: 'b',
          id: '2'
        },
        {
          name: 'c',
          id: '3'
        }
      ])

      //    async function getList() {
      //        const res = await
      //     list.value=res.data?.list||[]
      //    }
      const columns = [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '编号',
          prop: 'id'
        },
        {
          label: '路线',
          prop: 'changeMission'
        },
        {
          label: '结果',
          prop: 'result'
        },
        {
          label: '时间',
          prop: 'time'
        }
      ]
      return () => (
        <ElCard class="box-card">
          {{
            header: () => <span>巡检任务</span>,
            default: () => (
              <ElTable height="100vh" data={list.value} highlight-current-row>
                {columns.map((item) => (
                  <ElTableColumn property={item.prop} label={item.label} />
                ))}
              </ElTable>
            )
          }}
        </ElCard>
      )
    }
  })
  return {
    PatrolTaskTable
  }
}
