import {
  ElButton,
  ElDialog,
  ElDivider,
  // ElDropdown,
  // ElDropdownItem,
  // ElDropdownMenu,
  ElNotification,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElPageHeader,
  ElTable,
  ElTableColumn,
  ElOption,
  ElSelect,
  ElSwitch
} from 'element-plus'
import { computed, ref, toRaw, watch, Fragment } from 'vue'
import { bindCamera, createCamera, deleteCamera, getCameraList, updateCamera } from '@/api'
import { createDevice, deleteDevice, getDeviceListByCode, updateDevice,getDeviceTypeList } from '@/api'
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

  const deviceTypeList=ref([])

  async function getList() {
    let data: any[] = []
    if (configType.value === configTypes.CAMERA) {
      const res = await getCameraList({ page: 1, limit: 9999999 })
      data = res.data.list || res.data
    }
   else if (configType.value === configTypes.DEVICE) {
      const res = await getDeviceListByCode(currentCar.value,'patroling')
      data = res.data.list || res.data
      const r = await getDeviceTypeList();
       deviceTypeList.value  = r.data || [];
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
            <div>
                  <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                        {t('shan-chu')}
                      </ElButton>
                      <ElButton link onClick={() => handleEdit(row)}>
                        {t('bian-ji')}{' '}
                      </ElButton>
                      <ElButton link onClick={() => handleConnect(row.id, row.rid)}>
                        {currentCar.value && row.rid === currentCar.value
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
          label:t('che-liang-bian-hao'),
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
          prop: 'status'
        },
        {
          label: t('cao-zuo'),
          slot: (row: Record<string, any>) => (
            <div> 
               <ElButton link loading={loading.value} onClick={() => handleDelete(row.id)}>
                  {t('shan-chu')}
                </ElButton>
                <ElButton link onClick={() => handleEdit(row)}>
                {t('bian-ji')}{' '}
              </ElButton>
              </div>
          )
        }
      ]
    } else {
      return []
    }
  })

  const loading = ref(false)
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
    }else if (configType.value === configTypes.DEVICE){
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
    } else if (configType.value === configTypes.DEVICE){
      return {
        rid: [{ required: false, message:t('che-liang-bian-hao') }],
        name: [{ required: true, message:t('wai-she-ming-cheng') }],
        type: [{ required: true, message: t('wai-she-lei-xing') }],
        intranatPort: [{ required: true, message:t('nei-wang-duan-kou') }],
        intranatIp: [{ required: true, message: t('nei-wang-ip') }],
        internatPort: [{ required: true, message: t('wai-wang-duan-kou') }],
        internatIp:[{ required: true, message:t('wai-wang-ip')  }]
      }
    }
    else {
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
    }else if (configType.value === configTypes.DEVICE) {
      return [
        {
          prop: 'rid',
          title: t('che-liang-bian-hao'),
          slot:() => <ElInput v-model={currentCar.value} disabled  ></ElInput>,
        },
        {
          prop: 'name',
          title: t('wai-she-ming-cheng'),
        },
        {
          prop: 'type',
          title: t('wai-she-lei-xing'),
          slot: (form: Record<string, any>) => (
            <ElSelect  class="w-full"
            v-model={form.value["type"]}
            placeholder="外设类型"
            clearable>
               {deviceTypeList.value.map((item:any) => (
          <ElOption key={item} label={item.name} value={item.type}></ElOption>
        ))}
            </ElSelect>
          )
        },
        {
          prop: 'status',
          title:t('wai-she-zhuang-tai-0'),
          slot:(form: Record<string, any>)=>
            <ElSwitch v-model={form.value["status"]} active-text="开启" inactive-text="关闭"  style="--el-switch-off-color: #808080" active-value="1"
            inactive-value="0"/>
        },
        {
          prop: 'intranatPort',
          title:t('nei-wang-duan-kou')
        },
        {
          prop: 'intranatIp',
          title:t('nei-wang-ip')
        },
        {
          prop: 'internatPort',
          title:t('wai-wang-duan-kou')
        },
        {
          prop: 'internatIp',
          title: t('wai-wang-ip')
        },
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

  function handleVisible() {
    if (!currentCar.value) {
      ElNotification({
        title: t('ti-shi'),
        message: t('qing-xuan-ze-che-liang'),
      })
      return
    }
      dialogVisible.value =true
   
  
  }
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
    }else if(configType.value === configTypes.DEVICE){
      await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          try {
            let res: any
            if (form.value.id) {
              res = await updateDevice(form.value)
            } else {
              form.value.isDel=0
              form.value.rid=currentCar.value
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
        onClick={handleVisible}
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
