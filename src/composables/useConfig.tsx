import {
  ElButton,
  ElDialog,
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPageHeader,
  ElTable,
  ElTableColumn,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { computed, ref, toRaw, watch, type ComputedRef, type Ref } from 'vue'
import { Fragment } from 'vue/jsx-runtime'
import { bindCamera, createCamera, deleteCamera, getCameraList, updateCamera } from '../api/camera'
import { currentCar, haveCurrentCar } from '../shared/index'

export const useConfig = () => {
  const configTypes = {
    CAMERA: 'CAMERA',
    DEVICE: 'DEVICE'
  }

  const isConfig = ref(false)
  const configType = ref('')
  const configData: Ref<any[]> = ref([])
  watch(isConfig, () => getList())

  async function getList() {
    let data: any[] = []
    if (configType.value === configTypes.CAMERA) {
      const res = await getCameraList({ page: 1, limit: 9999999 })
      data = res.data.list || res.data
    }
    configData.value = data
  }
  const configColumns = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return [
        {
          label: '摄像头名称',
          prop: 'name'
        },
        {
          label: '拉流地址',
          prop: 'rtsp'
        },
        {
          label: '关联状态',
          prop: 'rid',
          slot: (row: any) => (currentCar.value && row.rid === currentCar.value ? '已关联' : '')
        },
        {
          label: '操作',
          slot: (row: Record<string, any>) => (
            <ElDropdown>
              {{
                default: () => '操作',
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem>
                      <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                        删除
                      </ElButton>
                    </ElDropdownItem>
                    <ElDropdownItem>
                      <ElButton link onClick={() => handleEdit(row)}>
                        编辑
                      </ElButton>
                    </ElDropdownItem>
                    <ElDropdownItem>
                      <ElButton link onClick={() => handleConnect(row.id, row.rid)}>
                        {currentCar.value && row.rid === currentCar.value ? '取消关联' : '关联'}
                      </ElButton>
                    </ElDropdownItem>
                  </ElDropdownMenu>
                )
              }}
            </ElDropdown>
          )
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

  const loading = ref(false)
  async function handleDelete(id: number) {
    loading.value = true
    try {
      const res: any = await deleteCamera(id)
      ElMessage({ type: 'success', message: res.message })
      getList()
    } finally {
      loading.value = false
      getList()
    }
  }

  const dialogVisible = ref(false)

  interface TableRowData {
    row: Record<string, unknown>
  }

  interface formField {
    prop: string
    title: string
    slot?: (form: Ref<any>) => JSX.Element
  }

  const formRef: Ref<FormInstance | undefined> = ref()
  const form: Ref<Record<string, any>> = ref({})
  const formRules: ComputedRef<FormRules> = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return {
        name: [{ required: true, message: '请输入名称' }],
        rtsp: [{ required: true, message: '拉流地址' }]
      }
    } else {
      return {}
    }
  })
  const formFields: ComputedRef<formField[]> = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return [
        {
          prop: 'name',
          title: '名称'
        },
        {
          prop: 'rtsp',
          title: '拉流地址'
        }
      ]
    } else {
      return []
    }
  })
  function handleCancel() {
    formRef.value?.resetFields()
    form.value = {}
    dialogVisible.value = false
  }

  async function handleSubmit() {
    await formRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        try {
          let res: any
          if (form.value.id) {
            res = await updateCamera(form.value)
          } else {
            res = await createCamera(form.value)
          }
          ElMessage({ type: 'success', message: res.message })
          handleCancel()
        } finally {
          loading.value = false
          getList()
        }
      }
    })
  }

  function handleEdit(data: any) {
    dialogVisible.value = true
    form.value = Object.assign({}, toRaw(data))
  }

  async function handleConnect(id: string, rid: string) {
    if (haveCurrentCar()) {
      const data = {
        id,
        rid: rid === currentCar.value ? '' : currentCar.value,
        rtype: 'patroling'
      }
      const res: any = await bindCamera(data)
      ElMessage({ type: 'success', message: res.message })
      getList()
    }
  }

  const FormDialog = () => (
    <ElDialog
      model-value={dialogVisible.value}
      title="添加"
      close-on-click-modal={false}
      close-on-press-escape={false}
      onClose={handleCancel}
    >
      {{
        default: () => (
          <ElForm ref={formRef} model={form} rules={formRules.value} label-width="100">
            {formFields.value.map((item) => (
              <ElFormItem label={item.title} prop={item.prop}>
                {item.slot ? item.slot(form) : <ElInput v-model={form.value[item.prop]} />}
              </ElFormItem>
            ))}
          </ElForm>
        ),
        footer: () => (
          <Fragment>
            <ElButton loading={loading.value} type="primary" onClick={handleSubmit}>
              确定
            </ElButton>
            <ElButton onClick={handleCancel}>取消</ElButton>
          </Fragment>
        )
      }}
    </ElDialog>
  )

  const ConfigSection = () => (
    <Fragment>
      <ElPageHeader onBack={() => (isConfig.value = false)}>
        {{
          title: () => '返回'
        }}
      </ElPageHeader>
      <ElDivider></ElDivider>
      <ElButton
        size="large"
        onClick={() => {
          dialogVisible.value = true
        }}
      >
        添加
      </ElButton>
      <ElDivider></ElDivider>
      <ElTable data={configData.value}>
        {configColumns.value.map((item) => (
          <ElTableColumn key={item.prop} prop={item.prop} label={item.label}>
            {{
              default: ({ row }: TableRowData) => item.slot && item.slot(row)
            }}
          </ElTableColumn>
        ))}
      </ElTable>
      <FormDialog />
    </Fragment>
  )
  return {
    ConfigSection,
    isConfig,
    configType,
    configTypes
  }
}
