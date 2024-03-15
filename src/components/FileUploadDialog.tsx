import { fileUploadDialogVisible } from '@/shared/map/file'
import type { PointData } from '@/types'
import { getToken } from '@/utils'
import { ElButton, ElDialog, ElMessage, ElUpload, type UploadInstance } from 'element-plus'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  emits: ['confirm'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const uploadRef = ref<UploadInstance | null>(null)
    const submitUpload = () => {
      if (uploadRef.value) {
        uploadRef.value.submit()
      }
    }

    const fileData = ref<PointData[]>([])
    const handleSuccess = (response: { data: PointData[] }) => {
      fileData.value = response.data
      emit('confirm', fileData.value)
    }

    const beforeAvatarUpload = (rawFile: any) => {
      const fileExtension = rawFile.name.split('.').pop().toLowerCase()
      if (fileExtension !== 'plan') {
        ElMessage.error(t('qing-shang-chuan-zheng-que-de-lu-xian-wen-jian'))
        return false
      }
      ElMessage({
        type: 'success',
        message: t('shang-chuan-cheng-gong')
      })
      return true
    }

    const handleClose = () => {
      // 关闭弹窗时重置上传组件的状态
      if (uploadRef.value) {
        uploadRef.value.clearFiles() // 清空上传的文件
      }
      fileUploadDialogVisible.value = false // 关闭弹窗
    }
    return () => (
      <ElDialog
        v-model={fileUploadDialogVisible.value}
        title={t('shang-chuan-wen-jian')}
        width="50vw"
        align-center
        onClose={handleClose}
      >
        {{
          default: () => (
            <ElUpload
              ref={uploadRef}
              headers={{ Authorization: getToken() }}
              action={`http://${window.location.host}/api/vehicle-task/v1/plan/parse`}
              limit={1}
              auto-upload={false}
              on-success={handleSuccess}
              before-upload={beforeAvatarUpload}
            >
              <ElButton type="primary">{t('xuan-ze-lu-xian-wen-jian')}</ElButton>
            </ElUpload>
          ),
          footer: () => (
            <ElButton size="large" type="primary" class="w-full" onClick={submitUpload}>
              {t('shang-chuan-lu-xian')}
            </ElButton>
          )
        }}
      </ElDialog>
    )
  }
})
