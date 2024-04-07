<template>
  <div>
    <div>{{ t('yun-tai-kong-zhi') }}</div>
    <div class="flex justify-center mb-2">
      <el-row class="w-48">
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full" @click="onClick(keyMap.UP)">
            <i-bxs-up-arrow />
          </el-button>
        </el-col>
        <el-row class="w-full">
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClick(keyMap.LEFT)">
              <i-bxs-left-arrow />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClick(keyMap.STOP)">
              <i-icomoon-free-switch />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full" @click="onClick(keyMap.RIGHT)">
              <i-bxs-right-arrow />
            </el-button>
          </el-col>
        </el-row>
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full" @click="onClick(keyMap.DOWN)">
            <i-bxs-down-arrow />
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div>
      <el-row :gutter="8">
        <el-col :span="12">
          <el-button size="large" class="w-full" @click="onClick(keyMap.RECALL)">{{
            t('zhao-hui')
          }}</el-button>
        </el-col>
        <el-col :span="12">
          <el-button size="large" class="w-full" @click="handleCalibrate()">{{
            t('xiao-zhun')
          }}</el-button>
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
          :min="-179"
          :max="179"
          :show-input-controls="false"
          @change="handleChangeAngle(angleTypes.HORIZON)"
        />
      </div>
      <div class="flex items-center">
        <span class="mr-2">{{ t('chui-zhi-jiao-du') }}</span>
        <el-slider
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
import { patrolingCruise } from '@/api'
import { debounce } from 'lodash'
import { ref } from 'vue'
import { currentCar } from '../shared/index'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { haveCurrentCar } from '@/shared'
import { postCalibrate } from '../api/control'

// 国际化
const { t } = useI18n()

// 水平角度
const horizonAngle = ref(0)
// 垂直角度
const verticalAngle = ref(0)

const angleTypes = {
  HORIZON: 3,
  VERTICAL: 4
}

// 不同功能映射值
const keyMap = {
  UP: 8,
  LEFT: 4,
  STOP: 255,
  RIGHT: 2,
  DOWN: 16,
  RECALL: 7
}

// 点击触发不同个功能
function onClick(param3: number) {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 6,
      param2: 5,
      param3,
      param4: 0
    }
    patrolingCruise(data)
  }
}

// 修改水平角度
const changeHorizonAngle = createDebouce(angleTypes.HORIZON, horizonAngle)

// 修改垂直角度
const changeVerticalAngle = createDebouce(angleTypes.VERTICAL, verticalAngle)

// 转换成防抖函数，防止过多调度
function createDebouce(param2: number, ref: Ref<number>) {
  return debounce(async () => {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: 6,
        param2,
        param3: ref.value,
        param4: 0
      }
      patrolingCruise(data)
    }
  }, 500)
}

// 修改角度
function handleChangeAngle(type: number) {
  if (type === angleTypes.HORIZON) {
    changeHorizonAngle()
  } else if (type === angleTypes.VERTICAL) {
    changeVerticalAngle()
  }
}

const handleCalibrate = () => {
  if (haveCurrentCar()) {
    postCalibrate({ code: currentCar.value, waitingTime: 20 })
  }
}
</script>
