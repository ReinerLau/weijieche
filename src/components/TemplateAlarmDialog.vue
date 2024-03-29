<script setup lang="ts">
import { alarmDialogVisible } from '@/shared/map/alarm'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { handleAlarmAction } from '@/composables'

const srcList: string[] = []
const imgUrl = ref<string>('')

const props = defineProps<{
  wsdata: { picPath: string; message: string; code: string }
}>()

const { t } = useI18n()

watch(
  () => props.wsdata.picPath,
  (val) => {
    imgUrl.value = ''
    srcList.length = 0
    imgUrl.value = val
    srcList.push(val)
  }
)
// let type = null
// const messageToType: {
//   [key: string]: number
//   人员入侵: number
//   铁丝网识别: number
//   敬礼识别: number
// } = {
//   人员入侵: 1,
//   铁丝网识别: 2,
//   敬礼识别: 3
// }
// async function handleAlarmAction(mode: number) {
//   type = messageToType[props.wsdata.message]
//   await getHandleAlarm(props.wsdata.code, type, mode)
//   ElMessage({ type: 'success', message: t('cao-zuo-cheng-gong') })
//   alarmDialogVisible.value = false
// }
</script>

<template>
  <el-dialog
    v-model="alarmDialogVisible"
    :title="props.wsdata.message"
    width="50vw"
    align-center
    class="flex flex-col"
    draggable
  >
    <template #default>
      <div class="flex items-center justify-around">
        <el-image
          class="w-28 h-28"
          :src="imgUrl"
          fit="cover"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="srcList"
          :initial-index="0"
        ></el-image>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-around">
        <el-button size="large" class="w-full mr-4" @click="handleAlarmAction(props.wsdata, 0)">{{
          t('bu-zuo-chu-li')
        }}</el-button>
        <el-button
          size="large"
          type="primary"
          class="w-full"
          @click="handleAlarmAction(props.wsdata, 1)"
          >{{ t('shou-dong-chu-li') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>
