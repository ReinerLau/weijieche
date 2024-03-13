import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { ref, type ComputedRef, type Ref, computed, Fragment, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { createPointTask, updatePointTask, getPointTaskList, deletePointTask } from '@/api'

export const usePointTask = () => {
  const { t } = useI18n()
  //配置路径点
  const pointSettingDialogVisible = ref(false)
  const loading = ref(false)
  interface formField {
    prop: string
    title: string
    slot?: (form: Ref<any>) => JSX.Element
  }
  // element plus 表单组件实例
  const formRef: Ref<FormInstance | undefined> = ref()
  // 表单数据
  const form: Ref<Record<string, any>> = ref({})
  const taskPointList: Ref<any[]> = ref([])
  const taskPoint = ref<(() => void) | null>(null)
  const pointCoordinates: Ref<string> = ref('')

  async function getList() {
    const res = await getPointTaskList()
    taskPointList.value = res.data?.list || []
    return res.data?.list || []
  }

  //处理添加/编辑
  function handleTaskEvent(c: any, callback: () => void) {
    pointCoordinates.value = ''
    taskPoint.value = () => {}
    pointSettingDialogVisible.value = true
    if (c.id) {
      pointCoordinates.value = c.gps
      form.value = Object.assign({}, c)
      const cameraAngle = c.cameraAngle.map((item: any) => {
        if (item.x & item.y) {
          return `${item.x},${item.y}`
        } else {
          return item
        }
      })
      form.value['cameraAngle'] = cameraAngle
    } else {
      pointCoordinates.value = c
    }
    taskPoint.value = callback
  }

  //删除
  async function deleteTaskEvent(id: number) {
    await deletePointTask(id)
  }
  const PointSettingFormDialog = defineComponent({
    emits: ['confirm'],
    setup() {
      // 表单校验规则
      const formRules: ComputedRef<FormRules> = computed(() => {
        return {
          name: [{ required: false, message: t('qing-shu-ru-ming-cheng') }],
          cameraAngle: [
            {
              required: true,
              message: t('qing-xuan-ze-she-xiang-tou-zhuan-dong-jiao-du')
            }
          ],
          type: [{ required: true, message: t('qing-xuan-ze-ren-wu-lei-xing') }],
          time: [
            {
              required: true,
              message: t('qing-shu-ru-ting-liu-shi-jian-s')
            }
          ]
        }
      })

      //任务类型
      const taskTypeList = [
        {
          name: t('xun-jian-ren-wu'),
          type: 1
        },
        {
          name: t('shi-bie-ren-wu'),
          type: 2
        }
      ]

      const cameraAngleList: any = []

      // 表单字段
      const formFields: ComputedRef<formField[]> = computed(() => {
        return [
          {
            prop: 'name',
            title: t('ming-cheng')
          },
          {
            prop: 'type',
            title: t('ren-wu-lei-xing'),
            slot: (form: Record<string, any>) => (
              <ElSelect
                class="w-full"
                v-model={form.value['type']}
                placeholder={t('qing-xuan-ze-ren-wu-lei-xing')}
                clearable
              >
                {taskTypeList.map((item: any) => (
                  <ElOption key={item} label={item.name} value={item.type}></ElOption>
                ))}
              </ElSelect>
            )
          },
          {
            prop: 'gps',
            title: t('lu-jing-dian-jing-wei-du-zuo-biao'),
            slot: () => <ElInput v-model={pointCoordinates.value} disabled></ElInput>
          },
          {
            prop: 'time',
            title: t('ting-liu-shi-jian-s'),
            slot: () => <ElInputNumber min={0} v-model={form.value['time']}></ElInputNumber>
          },
          {
            prop: 'cameraAngle',
            title: t('she-xiang-tou-zhuan-dong-jiao-du'),
            slot: () => (
              <ElSelect
                class="w-full"
                v-model={form.value['cameraAngle']}
                multiple
                filterable
                allow-create
                default-first-option
                reserve-keyword={false}
                placeholder={t('qing-tian-xie-xy-zhi-dou-hao-fen-ge-ru-12')}
              >
                {cameraAngleList.map((item: any) => (
                  <ElOption key={item} label={item.label} value={item.value}></ElOption>
                ))}
              </ElSelect>
            )
          }
        ]
      })

      // 提交表单数据
      async function handleSubmit() {
        await formRef.value?.validate(async (valid: boolean) => {
          if (valid) {
            loading.value = true
            try {
              let res: any
              if (form.value['cameraAngle'] !== undefined) {
                form.value['cameraAngle'] = form.value['cameraAngle'].map((item: any) => {
                  const [x, y] = item.split(/,|、|，/).map(Number) // 将每个元素按逗号分割后转换为数字
                  return { x, y }
                })
              }

              if (form.value.id) {
                res = await updatePointTask(form.value)
              } else {
                form.value.gps = pointCoordinates.value
                res = await createPointTask(form.value)
              }
              //更新数据
              if (typeof taskPoint.value === 'function') {
                taskPoint.value()
              }
              ElMessage({ type: 'success', message: res.message })
              handleCancel()
            } finally {
              loading.value = false
            }
          }
        })
      }

      // 关闭表单弹窗
      function handleCancel() {
        formRef.value?.resetFields()
        form.value = {}
        pointSettingDialogVisible.value = false
      }

      return () => (
        <ElDialog
          title={t('pei-zhi-lu-jing-dian-ren-wu')}
          align-center
          model-value={pointSettingDialogVisible.value}
          close-on-click-modal={false}
          close-on-press-escape={false}
          onClose={handleCancel}
          width="50vw"
        >
          {{
            default: () => (
              <ElForm
                ref={formRef}
                model={form}
                rules={formRules.value}
                label-width="200"
                label-position="top"
              >
                {formFields.value.map((item: any) => (
                  <ElFormItem label={item.title} prop={item.prop}>
                    {item.slot ? item.slot(form) : <ElInput v-model={form.value[item.prop]} />}
                  </ElFormItem>
                ))}
              </ElForm>
            ),
            footer: () => (
              <Fragment>
                <ElButton
                  loading={loading.value}
                  type="primary"
                  onClick={() => {
                    handleSubmit()
                  }}
                >
                  {t('que-ding')}
                </ElButton>
              </Fragment>
            )
          }}
        </ElDialog>
      )
    }
  })

  return {
    handleTaskEvent,
    PointSettingFormDialog,
    pointSettingDialogVisible,
    getList,
    deleteTaskEvent
  }
}
