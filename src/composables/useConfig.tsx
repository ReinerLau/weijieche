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
  ElTableColumn
} from 'element-plus'
import { computed, ref, toRaw, watch, Fragment } from 'vue'
import { bindCamera, createCamera, deleteCamera, getCameraList, updateCamera } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import type { Ref, ComputedRef } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'

export const useConfig = () => {
  const { t } = useI18n()
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
          label: t('she-xiang-tou-ming-cheng'),
          prop: 'name'
        },
        {
          label: t('la-liu-di-zhi'),
          prop: 'rtsp'
        },
        {
          label: t('guan-lian-zhuang-tai'),
          prop: 'rid',
          slot: (row: any) =>
            currentCar.value && row.rid === currentCar.value ? t('yi-guan-lian') : ''
        },
        {
          label: t('cao-zuo'),
          slot: (row: Record<string, any>) => (
            <ElDropdown>
              {{
                default: () => t('cao-zuo'),
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem>
                      <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                        {t('shan-chu')}
                      </ElButton>
                    </ElDropdownItem>
                    <ElDropdownItem>
                      <ElButton link onClick={() => handleEdit(row)}>
                        {t('bian-ji')}{' '}
                      </ElButton>
                    </ElDropdownItem>
                    <ElDropdownItem>
                      <ElButton link onClick={() => handleConnect(row.id, row.rid)}>
                        {currentCar.value && row.rid === currentCar.value
                          ? t('qu-xiao-guan-lian')
                          : t('guan-lian')}
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
          label: t('she-bei-bian-hao'),
          prop: 'id'
        },
        {
          label: t('wai-she-ming-cheng'),
          prop: 'name'
        },
        {
          label: t('wai-she-lei-xing'),
          prop: 'type'
        },
        {
          label: t('wai-she-zhuang-tai'),
          prop: 'status'
        },
        {
          label: t('cao-zuo'),
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
        name: [{ required: true, message: t('qing-shu-ru-ming-cheng') }],
        rtsp: [{ required: true, message: t('la-liu-di-zhi') }]
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
          title: t('ming-cheng')
        },
        {
          prop: 'rtsp',
          title: t('la-liu-di-zhi')
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
      title={t('tian-jia')}
      close-on-click-modal={false}
      close-on-press-escape={false}
      onClose={handleCancel}
      width="80%"
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
              {t('que-ding')}
            </ElButton>
          </Fragment>
        )
      }}
    </ElDialog>
  )

  const ConfigSection = () => (
    <Fragment>
      <ElPageHeader onBack={() => (isConfig.value = false)}>
        {{
          title: () => t('fan-hui')
        }}
      </ElPageHeader>
      <ElDivider></ElDivider>
      <ElButton
        size="large"
        onClick={() => {
          dialogVisible.value = true
        }}
      >
        {t('tian-jia')}
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
