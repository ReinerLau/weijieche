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
import { createPointTask, updatePointTask, getPointTaskList } from '@/api'

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
  //添加
  function createTaskEvent(c: any, callback: () => void) {
    pointSettingDialogVisible.value = true
    taskPoint.value = callback
    pointCoordinates.value = c
  }
  // 编辑
  function editTaskEvent(data: any) {
    pointSettingDialogVisible.value = true
    form.value = Object.assign({}, toRaw(data))
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
      async function handleSubmit(callback: () => void) {
        await formRef.value?.validate(async (valid: boolean) => {
          if (valid) {
            loading.value = true
            try {
              let res: any
              form.value.gps = pointCoordinates.value
              if (form.value.id) {
                res = await updatePointTask(form.value)
              } else {
                res = await createPointTask(form.value)
              }
              ElMessage({ type: 'success', message: res.message })
              handleCancel()
              if (typeof callback === 'function') {
                callback()
              }
              getList()
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
          title="t('pei-zhi-lu-jing-dian-ren-wu')"
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
                    if (taskPoint.value !== null) {
                      handleSubmit(taskPoint.value)
                    }
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
    createTaskEvent,
    editTaskEvent,
    PointSettingFormDialog,
    pointSettingDialogVisible,
    getList
  }
}
