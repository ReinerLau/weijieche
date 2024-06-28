<template>
  <div>
    <div>{{ t('yun-tai-kong-zhi') }}</div>
    <div class="flex justify-center mb-2">
      <el-row class="w-48">
        <el-col :span="8" :offset="8">
          <el-button
            size="large"
            class="w-full"
            @click="onClickPantilt(PantiltMode.UP, verticalSpeed)"
          >
            <Icon icon="bxs:up-arrow"></Icon>
          </el-button>
        </el-col>
        <el-row class="w-full">
          <el-col :span="8">
            <el-button
              size="large"
              class="w-full"
              @click="onClickPantilt(PantiltMode.LEFT, horizonSpeed)"
            >
              <Icon icon="bxs:left-arrow"></Icon>
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClickPantilt(PantiltMode.STOP, 255)">
              <Icon icon="icomoon-free:switch"></Icon>
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button
              size="large"
              class="w-full"
              @click="onClickPantilt(PantiltMode.RIGHT, horizonSpeed)"
            >
              <Icon icon="bxs:right-arrow"></Icon>
            </el-button>
          </el-col>
        </el-row>
        <el-col :span="8" :offset="8">
          <el-button
            size="large"
            class="w-full"
            @click="onClickPantilt(PantiltMode.DOWN, verticalSpeed)"
          >
            <Icon icon="bxs:down-arrow"></Icon>
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="my-3">
      <el-row :gutter="8">
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(PantiltMode.RESET, 255)">{{
            t('fu-wei')
          }}</el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(PantiltMode.RECALL, 255)">{{
            t('che-shou')
          }}</el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(PantiltMode.INITIAL, 255)">
            {{ t('chu-shi-hua') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex items-center">
        <span class="mr-2">{{ t('shui-ping-jiao-du') }}</span>
        <ElSlider
          v-model="horizonAngle"
          class="flex-1"
          :step="1"
          :min="0"
          :max="360"
          :show-input-controls="false"
          @change="handleChangeAngle()"
        />
      </div>
      <div class="flex items-center">
        <span class="mr-2">{{ t('chui-zhi-jiao-du') }}</span>
        <ElSlider
          v-model="verticalAngle"
          class="flex-1"
          :step="1"
          :min="-20"
          :max="20"
          :show-input-controls="false"
          @change="handleChangeAngle()"
        />
      </div>
      <div class="flex items-center">
        <span class="mr-2">{{ t('shui-ping-su-du') }}</span>
        <el-slider
          v-model="horizonSpeed"
          class="flex-1"
          :step="1"
          :min="1"
          :max="10"
          :show-input-controls="false"
          @change="handleChangeSpeed()"
        />
      </div>
      <div class="flex items-center">
        <span class="mr-2">{{ t('chui-zhi-su-du') }}</span>
        <el-slider
          v-model="verticalSpeed"
          class="flex-1"
          :step="1"
          :min="1"
          :max="10"
          :show-input-controls="false"
          @change="handleChangeSpeed()"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api'
import {
  horizonAngle,
  horizonSpeed,
  usePantilt,
  verticalAngle,
  verticalSpeed
} from '@/composables/usePantilt'
import { haveCurrentCar } from '@/shared'
import { Icon } from '@iconify/vue'
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'
import { currentCar } from '../shared/index'

const { onClickPantilt, PantiltMode } = usePantilt()

// 国际化
const { t } = useI18n()

const Types = {
  ANGLE: 5,
  SPEED: 10
}

// 修改角度
const changeAngle = createDebouce(Types.ANGLE)

// 修改速度
const changeSpeed = createDebouce(Types.SPEED)

// 转换成防抖函数，防止过多调度
function createDebouce(param2: number) {
  return debounce(async () => {
    if (haveCurrentCar()) {
      let array = []
      array.push(horizonSpeed.value)
      array.push(verticalSpeed.value)
      if (param2 === Types.ANGLE) {
        array.push(horizonAngle.value)
        array.push(verticalAngle.value)
      }
      const data = {
        code: currentCar.value,
        param1: 3,
        param2,
        param3: array.join(','),
        param4: 255
      }
      patrolingCruise(data)
    }
  }, 500)
}

// 修改角度
function handleChangeAngle() {
  changeAngle()
}

//修改速度
function handleChangeSpeed() {
  changeSpeed()
}
</script>
