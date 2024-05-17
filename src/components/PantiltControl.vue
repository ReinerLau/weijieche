<template>
  <div>
    <div>{{ t('yun-tai-kong-zhi') }}</div>
    <div class="flex justify-center mb-2">
      <el-row class="w-48">
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(Type.UP, verticalSpeed)">
            <i-bxs-up-arrow />
          </el-button>
        </el-col>
        <el-row class="w-full">
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClickPantilt(Type.LEFT, horizonSpeed)">
              <i-bxs-left-arrow />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClickPantilt(Type.STOP, 255)">
              <i-icomoon-free-switch />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button
              size="large"
              class="w-full"
              @click="onClickPantilt(Type.RIGHT, horizonSpeed)"
            >
              <i-bxs-right-arrow />
            </el-button>
          </el-col>
        </el-row>
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(Type.DOWN, verticalSpeed)">
            <i-bxs-down-arrow />
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="my-3">
      <el-row :gutter="8">
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(Type.RESET, 255)">{{
            t('fu-wei')
          }}</el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(Type.RECALL, 255)">{{
            t('che-shou')
          }}</el-button>
        </el-col>
        <el-col :span="8">
          <el-button size="large" class="w-full" @click="onClickPantilt(Type.INITIAL, 255)">
            {{ t('chu-shi-hua') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex items-center">
        <span class="mr-2">{{ t('shui-ping-jiao-du') }}</span>
        <el-slider
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
        <el-slider
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
import { usePantilt } from '@/composables/usePantilt'
import { haveCurrentCar } from '@/shared'
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'
import { currentCar } from '../shared/index'

const { onClickPantilt, Type, horizonSpeed, verticalSpeed, horizonAngle, verticalAngle } =
  usePantilt()

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
