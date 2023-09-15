import { ElButton, ElDivider, ElPageHeader, ElTable, ElTableColumn } from 'element-plus'
import { computed, ref, type Ref } from 'vue'
import { Fragment } from 'vue/jsx-runtime'

export const useConfig = () => {
  const configTypes = {
    CAMERA: 'CAMERA',
    DEVICE: 'DEVICE'
  }

  const isConfig = ref(false)
  const configType = ref('')
  const configData: Ref<any[]> = ref([])
  const configColumns = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return [
        {
          label: '编号',
          prop: 'id'
        },
        {
          label: '摄像头名称',
          prop: 'name'
        },
        {
          label: '品牌',
          prop: 'brand'
        },
        {
          label: 'ip地址',
          prop: 'ip'
        },
        {
          label: '端口',
          prop: 'port'
        },
        {
          label: '关联车辆',
          prop: 'rid'
        }
      ]
    } else if (configType.value === configTypes.DEVICE) {
      return [
        {
          label: '设备编号',
          prop: 'id'
        },
        {
          label: '外设名称',
          prop: 'name'
        },
        {
          label: '外设类型',
          prop: 'type'
        },
        {
          label: '外设状态',
          prop: 'status'
        },
        {
          label: '操作',
          prop: 'action'
        }
      ]
    } else {
      return []
    }
  })
  const ConfigSection = () => (
    <Fragment>
      <ElPageHeader onBack={() => (isConfig.value = false)} />
      <ElDivider></ElDivider>
      <ElButton size="large">添加</ElButton>
      <ElTable data={configData.value}>
        {configColumns.value.map((item) => (
          <ElTableColumn key={item.prop} prop={item.prop} label={item.label} />
        ))}
      </ElTable>
    </Fragment>
  )
  return {
    ConfigSection,
    isConfig,
    configType,
    configTypes
  }
}
