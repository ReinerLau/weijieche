import { createPointTask, updatePointTask } from '@/api'
import {
  form,
  pointCoordinates,
  pointSettingDialogVisible,
  taskPoint
} from '@/shared/map/taskPoint'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElSelect
} from 'element-plus'
import { cloneDeep } from 'lodash'
import type { ComputedRef, Ref } from 'vue'
import { Fragment, computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface formField {
  prop: string
  title: string
  slot?: (form: Ref<any>) => JSX.Element
}

export default defineComponent({
  setup() {
    const { t } = useI18n()
    const loading = ref(false)
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

    // element plus 表单组件实例
    const formRef: Ref<FormInstance | undefined> = ref()

    //任务类型
    const taskTypeList = [
      {
        name: t('xun-jian-ren-wu'),
        type: 1
      },
      {
        name: t('tie-si-wang-shi-bie'),
        type: 2
      },
      {
        name: t('jing-li-shi-bie'),
        type: 3
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
              placeholder="请填写x,y值,逗号分隔，如：1,2"
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
      const cameraAngleData = cloneDeep(form.value)
      await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          try {
            let res: any
            if (form.value['cameraAngle'] !== undefined) {
              cameraAngleData.cameraAngle = form.value['cameraAngle'].map((item: any) => {
                const [x, y] = item.split(/,|、|，/).map((item: string) => {
                  return Number(item)
                }) // 将每个元素按逗号分割后转换为数字
                return { x, y }
              })
            }

            if (form.value.id) {
              res = await updatePointTask(cameraAngleData)
            } else {
              cameraAngleData.gps = pointCoordinates.value
              res = await createPointTask(cameraAngleData)
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
