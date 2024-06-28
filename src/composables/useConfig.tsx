import {
  bindCamera,
  createCamera,
  createDevice,
  deleteCamera,
  deleteDevice,
  getCameraList,
  getDeviceListByCode,
  getDeviceTypeList,
  updateCamera,
  updateDevice
} from '@/api'
import { currentCar } from '@/shared'
import { useCarStore } from '@/stores/car'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElDialog,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElNotification,
  ElOption,
  ElPageHeader,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn
} from 'element-plus'
import type { ComputedRef, Ref } from 'vue'
import { computed, Fragment, ref, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// 配置监控、配置外设相关
export const useConfig = () => {
  const { t } = useI18n()
  const carStore = useCarStore()

  // 不同的配置类型
  const configTypes = {
    CAMERA: 'CAMERA',
    DEVICE: 'DEVICE'
  }

  // 当前是否处于配置模式下
  const isConfig = ref(false)
  // 当前类型
  const configType = ref('')
  // 当前配置数据
  const configData: Ref<any[]> = ref([])
  // 每次进入配置模式重新获取配置数据
  watch(configType, () => getList())
  watch(isConfig, () => getList())
  watch(currentCar, () => (isConfig.value = false))

  // 设备类型数据
  const deviceTypeList = ref([])

  // 根据不同配置模式获取不同数据
  async function getList() {
    let data: any[] = []
    if (configType.value === configTypes.CAMERA) {
      const res = await getCameraList(carStore.currentCar, 'patroling')
      data = res.data.list || res.data
    } else if (configType.value === configTypes.DEVICE) {
      const res = await getDeviceListByCode(carStore.currentCar, 'patroling')
      data = res.data || []
      const r = await getDeviceTypeList()
      deviceTypeList.value = r.data || []
    }
    configData.value = data
  }

  // 不同配置下的表头
  const configColumns = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return [
        {
          label: t('she-xiang-tou-ming-cheng'),
          prop: 'name'
        },
        {
          label: t('rtsp-di-zhi'),
          prop: 'rtsp'
        },
        {
          label: t('pin-pai'),
          prop: 'brand'
        },
        {
          label: t('guan-lian-zhuang-tai'),
          prop: 'rid',
          slot: (row: any) =>
            carStore.currentCar && row.rid === carStore.currentCar ? t('yi-guan-lian') : ''
        },
        {
          label: t('cao-zuo'),
          slot: (row: Record<string, any>) => (
            <div>
              <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                {t('shan-chu')}
              </ElButton>
              <ElButton link onClick={() => handleEdit(row)}>
                {t('bian-ji')}
              </ElButton>
              <ElButton link onClick={() => handleConnect(row.id, row.rid)}>
                {carStore.currentCar && row.rid === carStore.currentCar
                  ? t('qu-xiao-guan-lian')
                  : t('guan-lian')}
              </ElButton>
            </div>
          )
        }
      ]
    } else if (configType.value === configTypes.DEVICE) {
      return [
        {
          label: t('che-liang-bian-hao'),
          prop: 'rid'
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
          prop: 'status',
          slot: (row: any) => {
            if (Number(row.status) === 0) {
              return t('guan-bi')
            } else if (Number(row.status) === 1) {
              return t('kai-qi')
            } else {
              return ''
            }
          }
        },
        {
          label: t('cao-zuo'),
          slot: (row: Record<string, any>) => (
            <div>
              <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                {t('shan-chu')}
              </ElButton>
              <ElButton link onClick={() => handleEdit(row)}>
                {t('bian-ji')}
              </ElButton>
            </div>
          )
        }
      ]
    } else {
      return []
    }
  })

  // 配置数据获取过程中的 loading 是否可见
  const loading = ref(false)

  // 删除配置数据
  async function handleDelete(id: number) {
    if (configType.value === configTypes.CAMERA) {
      loading.value = true
      try {
        const res: any = await deleteCamera(id)
        ElMessage({ type: 'success', message: res.message })
        getList()
      } finally {
        loading.value = false
        getList()
      }
    } else if (configType.value === configTypes.DEVICE) {
      loading.value = true
      try {
        const res: any = await deleteDevice(id)
        ElMessage({ type: 'success', message: res.message })
        getList()
      } finally {
        loading.value = false
        getList()
      }
    }
  }

  // 新增/编辑表单是否可见
  const dialogVisible = ref(false)

  interface TableRowData {
    row: Record<string, unknown>
  }

  interface formField {
    prop: string
    title: string
    slot?: (form: Ref<any>) => JSX.Element
  }

  // element plus 表单组件实例
  const formRef: Ref<FormInstance | undefined> = ref()
  // 表单数据
  const form: Ref<Record<string, any>> = ref({})
  // 表单校验规则
  const formRules: ComputedRef<FormRules> = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return {
        name: [{ required: true, message: t('qing-shu-ru-ming-cheng') }],
        ip: [{ required: true, message: t('qing-shu-ru-ip') }],
        port: [{ required: true, message: t('qing-shu-ru-duan-kou') }],
        user: [{ required: true, message: t('qing-shu-ru-zhang-hao') }],
        password: [{ required: true, message: t('qing-shu-ru-mi-ma') }],
        rtsp: [{ required: true, message: t('la-liu-di-zhi') }]
      }
    } else if (configType.value === configTypes.DEVICE) {
      return {
        rid: [{ required: false, message: t('che-liang-bian-hao') }],
        name: [{ required: true, message: t('wai-she-ming-cheng') }],
        type: [{ required: true, message: t('wai-she-lei-xing') }],
        intranatPort: [{ required: true, message: t('nei-wang-duan-kou') }],
        intranatIp: [{ required: true, message: t('nei-wang-ip') }],
        internatPort: [{ required: true, message: t('wai-wang-duan-kou') }],
        internatIp: [{ required: true, message: t('wai-wang-ip') }]
      }
    } else {
      return {}
    }
  })

  // 表单字段
  const formFields: ComputedRef<formField[]> = computed(() => {
    if (configType.value === configTypes.CAMERA) {
      return [
        {
          prop: 'name',
          title: t('ming-cheng')
        },
        {
          prop: 'ip',
          title: t('ip')
        },
        {
          prop: 'port',
          title: t('duan-kou')
        },
        {
          prop: 'user',
          title: t('zhang-hao')
        },
        {
          prop: 'password',
          title: t('mi-ma')
        },
        {
          prop: 'brand',
          title: t('pin-pai')
        },
        {
          prop: 'rtsp',
          title: t('la-liu-di-zhi')
        }
      ]
    } else if (configType.value === configTypes.DEVICE) {
      return [
        {
          prop: 'rid',
          title: t('che-liang-bian-hao'),
          slot: () => <ElInput v-model={carStore.currentCar} disabled></ElInput>
        },
        {
          prop: 'name',
          title: t('wai-she-ming-cheng')
        },
        {
          prop: 'type',
          title: t('wai-she-lei-xing'),
          slot: (form: Record<string, any>) => (
            <ElSelect
              class="w-full"
              v-model={form.value['type']}
              placeholder={t('wai-she-lei-xing')}
              clearable
            >
              {deviceTypeList.value.map((item: any) => (
                <ElOption key={item} label={item.name} value={item.type}></ElOption>
              ))}
            </ElSelect>
          )
        },
        {
          prop: 'status',
          title: t('wai-she-zhuang-tai-0'),
          slot: (form: Record<string, any>) => (
            <ElSwitch
              class="my-2"
              v-model={form.value['status']}
              active-text={t('kai-qi')}
              inactive-text={t('guan-bi')}
              style="--el-switch-off-color: #808080"
              active-value="1"
              inactive-value="0"
            />
          )
        },
        {
          prop: 'intranatPort',
          title: t('nei-wang-duan-kou')
        },
        {
          prop: 'intranatIp',
          title: t('nei-wang-ip')
        },
        {
          prop: 'internatPort',
          title: t('wai-wang-duan-kou')
        },
        {
          prop: 'internatIp',
          title: t('wai-wang-ip')
        }
      ]
    } else {
      return []
    }
  })

  // 关闭表单弹窗
  function handleCancel() {
    formRef.value?.resetFields()
    form.value = {}
    dialogVisible.value = false
  }

  // 打开新增/编辑弹窗
  function handleVisible() {
    if (!carStore.currentCar) {
      ElNotification({
        title: t('ti-shi'),
        message: t('qing-xuan-ze-che-liang')
      })
      return
    }
    dialogVisible.value = true
  }

  // 提交表单数据
  async function handleSubmit() {
    if (configType.value === configTypes.CAMERA) {
      await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          try {
            let res: any
            if (form.value.id) {
              res = await updateCamera(form.value)
            } else {
              form.value.rtype = 'patroling'
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
    } else if (configType.value === configTypes.DEVICE) {
      await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          try {
            let res: any
            if (form.value.id) {
              form.value.status = Number(form.value.status)
              res = await updateDevice(form.value)
            } else {
              form.value.isDel = 0
              form.value.rid = carStore.currentCar
              form.value.rtype = 'patroling'
              form.value.status = Number(form.value.status)
              res = await createDevice(form.value)
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
  }

  // 编辑
  function handleEdit(data: any) {
    dialogVisible.value = true
    data.status = data.status.toString()
    form.value = Object.assign({}, toRaw(data))
  }

  // 关联摄像头
  async function handleConnect(id: string, rid: string) {
    const data = {
      id,
      rid: rid === carStore.currentCar,
      rtype: 'patroling'
    }
    const res: any = await bindCamera(data)
    ElMessage({ type: 'success', message: res.message })
    getList()
  }

  // 表单弹窗组件
  const FormDialog = () => (
    <ElDialog
      model-value={dialogVisible.value}
      title={t('tian-jia')}
      close-on-click-modal={false}
      close-on-press-escape={false}
      onClose={handleCancel}
      class="pr-14"
      width="60vw"
      align-center
    >
      {{
        default: () => (
          <ElForm ref={formRef} model={form} rules={formRules.value} label-width="200">
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

  // 配置表格区域
  const ConfigSection = () => (
    <Fragment>
      <ElPageHeader onBack={() => (isConfig.value = false)}>
        {{
          title: () => t('fan-hui')
        }}
      </ElPageHeader>
      <ElDivider></ElDivider>
      <ElButton size="large" onClick={handleVisible}>
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
