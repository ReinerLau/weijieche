import { ElButton, ElForm, ElFormItem, ElInput, ElDrawer } from 'element-plus'
import { ref, defineComponent } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { cloneDeep } from 'lodash'

// 配置监控、配置外设相关
export const usePointConfig = () => {
  // 国际化
  const { t } = useI18n()
  // 重置表单数据
  const defaultFormData: {
    xy: any
    speed: string
  } = {
    xy: {},
    speed: ''
  }

  // 新建的表单数据
  const formData: Ref<{
    xy?: any
    speed?: string
  }> = ref(cloneDeep(defaultFormData))
  // 抽屉是否可见
  const pointConfigDrawerVisible = ref<boolean>(false)

  const pointCoordinates = ref<string>('')
  //处理添加/编辑
  function handlePointConfigEvent(c: any, carNum: string): void {
    pointCoordinates.value = JSON.stringify(c)
    formData.value.speed = carNum
  }

  // 表单弹窗组件
  const PointConfigDrawer = defineComponent({
    emits: ['confirm'],
    setup(props, { emit }) {
      // 保存
      async function handleConfirm(): Promise<void> {
        formData.value.xy = JSON.parse(pointCoordinates.value)
        emit('confirm', formData.value)
        pointConfigDrawerVisible.value = false
      }

      return () => (
        <ElDrawer
          title={t('lu-xian-dian-gong-neng-she-zhi')}
          class="select-none"
          v-model={pointConfigDrawerVisible.value}
          size="50%"
        >
          {{
            default: () => (
              <ElForm label-width={100} model={formData.value}>
                <ElFormItem prop="xy" label={t('lu-xian-dian-zuo-biao')}>
                  <ElInput v-model={pointCoordinates.value} disabled></ElInput>
                </ElFormItem>
                <ElFormItem prop="speed" label={t('che-liang-su-du-ms')}>
                  <ElInput v-model={formData.value.speed} clearable></ElInput>
                </ElFormItem>
              </ElForm>
            ),
            footer: () => (
              <ElButton size="large" type="primary" class="w-full" onClick={handleConfirm}>
                {t('que-ding')}
              </ElButton>
            )
          }}
        </ElDrawer>
      )
    }
  })

  return {
    PointConfigDrawer,
    pointConfigDrawerVisible,
    handlePointConfigEvent
  }
}
