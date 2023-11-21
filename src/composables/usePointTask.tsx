import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  type FormInstance,
  type FormRules
} from 'element-plus'
import { ref, type ComputedRef, type Ref, computed, Fragment, toRaw, defineComponent } from 'vue'
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
  const pointCoordinates = ref({})

  async function getList() {
    const res = await getPointTaskList()
    taskPointList.value = res.data?.list || []
    return res.data?.list || []
  }

  //处理添加/编辑
  function handleTaskEvent(c: any, callback: () => void) {
    pointCoordinates.value = {}
    taskPoint.value = () => {}
    pointSettingDialogVisible.value = true
    if (c.id) {
      form.value = Object.assign({}, toRaw(c))
    }
    taskPoint.value = callback
    pointCoordinates.value = c
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
            { required: true, message: t('qing-xuan-ze-she-xiang-tou-zhuan-dong-jiao-du') }
          ],
          time: [{ required: true, message: t('qing-shu-ru-ting-liu-shi-jian-s') }]
        }
      })

      // 表单字段
      const formFields: ComputedRef<formField[]> = computed(() => {
        return [
          {
            prop: 'name',
            title: t('ming-cheng')
          },
          {
            prop: 'cameraAngle',
            title: t('she-xiang-tou-zhuan-dong-jiao-du')
          },
          {
            prop: 'gps',
            title: t('lu-jing-dian-jing-wei-du-zuo-biao'),
            slot: () => <ElInput v-model={pointCoordinates.value} disabled></ElInput>
          },
          {
            prop: 'time',
            title: t('ting-liu-shi-jian-s')
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
          width="60%"
        >
          {{
            default: () => (
              <ElForm ref={formRef} model={form} rules={formRules.value} label-width="200">
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
