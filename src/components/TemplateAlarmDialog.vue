<script setup lang="ts">
import { alarmDialogVisible } from '@/shared/map/alarm'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const srcList: string[] = []
const imgUrl = ref<string>('')

const props = defineProps<{
  wsdata: { picPath: string; message: string }
}>()

const handleAlarm = () => {
  alarmDialogVisible.value = false
}

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
</script>

<template>
  <el-dialog
    v-model="alarmDialogVisible"
    :title="wsdata.message"
    width="500"
    class="!mr-[1vw]"
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
      <div class="flex justify-between">
        <el-button size="large" class="w-full" @click="handleAlarm">{{
          t('bu-zuo-chu-li')
        }}</el-button>
        <el-button
          size="large"
          type="primary"
          class="w-full"
          @click="
            () => {
              alarmDialogVisible = false
            }
          "
          >{{ t('shou-dong-chu-li') }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>
