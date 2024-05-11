<template>
  <div>
    <div>{{ t('yun-tai-kong-zhi') }}</div>
    <div class="flex justify-center mb-2">
      <ElRow class="w-48">
        <ElCol :span="8" :offset="8">
          <ElButton size="large" class="w-full" @click="onClickPantilt(Type.DIRECTION, keyMap.UP)">
            <i-bxs-up-arrow />
          </ElButton>
        </ElCol>
        <ElRow class="w-full">
          <ElCol :span="8">
            <ElButton
              size="large"
              class="w-full"
              @click="onClickPantilt(Type.DIRECTION, keyMap.LEFT)"
            >
              <i-bxs-left-arrow />
            </ElButton>
          </ElCol>
          <ElCol :span="8">
            <ElButton
              size="large"
              class="w-full"
              @click="onClickPantilt(Type.DIRECTION, keyMap.STOP)"
            >
              <i-icomoon-free-switch />
            </ElButton>
          </ElCol>
          <ElCol :span="8">
            <ElButton
              size="large"
              class="w-full"
              @click="onClickPantilt(Type.DIRECTION, keyMap.RIGHT)"
            >
              <i-bxs-right-arrow />
            </ElButton>
          </ElCol>
        </ElRow>
        <ElCol :span="8" :offset="8">
          <ElButton
            size="large"
            class="w-full"
            @click="onClickPantilt(Type.DIRECTION, keyMap.DOWN)"
          >
            <i-bxs-down-arrow />
          </ElButton>
        </ElCol>
      </ElRow>
    </div>
    <div class="my-3">
      <ElRow :gutter="8">
        <ElCol :span="12">
          <ElButton
            size="large"
            class="w-full"
            @click="onClickPantilt(Type.RECALL, keyMap.RECALL)"
            >{{ t('zhao-hui') }}</ElButton
          >
        </ElCol>
        <ElCol :span="12">
          <ElButton size="large" class="w-full" @click="handleCalibrate()">{{
            t('xiao-zhun')
          }}</ElButton>
        </ElCol>
      </ElRow>
    </div>
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex items-center">
        <span class="mr-2">{{ t('shui-ping-jiao-du') }}</span>
        <ElSlider
          v-model="horizonAngle"
          class="flex-1"
          :step="1"
          :min="-179"
          :max="179"
          :show-input-controls="false"
          @change="handleChangeAngle(angleTypes.HORIZON)"
        />
      </div>
      <div class="flex items-center">
        <span class="mr-2">{{ t('chui-zhi-jiao-du') }}</span>
        <ElSlider
          v-model="verticalAngle"
          class="flex-1"
          :step="1"
          :min="-179"
          :max="179"
          :show-input-controls="false"
          @change="handleChangeAngle(angleTypes.VERTICAL)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  angleTypes,
  handleChangeAngle,
  horizonAngle,
  keyMap,
  onClickPantilt,
  verticalAngle
} from '@/composables/usePantiltControl'
import { haveCurrentCar } from '@/shared'
import { ElButton, ElCol, ElRow, ElSlider } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { postCalibrate } from '../api/control'
import { currentCar } from '../shared/index'
// 国际化
const { t } = useI18n()

enum Type {
  DIRECTION = 5,
  RECALL = 6
}

const handleCalibrate = () => {
  if (haveCurrentCar()) {
    postCalibrate({ code: currentCar.value, waitingTime: 20 })
  }
}
</script>
