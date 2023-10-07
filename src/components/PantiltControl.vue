<template>
  <div>
    <div class="text-white">{{ t('yun-tai-kong-zhi') }}</div>
    <div class="flex justify-center">
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
            <el-button size="large" class="w-full" @click="onClick(keyMap.SWITCH)">
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
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex text-white items-center">
        <span class="mr-2">{{ t('shui-ping-jiao-du') }}</span>
        <el-slider
          v-model="horizonAngle"
          class="flex-1"
          :step="1"
          :min="-180"
          :max="180"
          :show-input-controls="false"
          @change="handleChangeAngle(angleTypes.HORIZON)"
        />
      </div>
      <div class="flex text-white items-center">
        <span class="mr-2">{{ t('chui-zhi-jiao-du') }}</span>
        <el-slider
          v-model="verticalAngle"
          class="flex-1"
          :step="1"
          :min="-180"
          :max="180"
          :show-input-controls="false"
          @change="handleChangeAngle(angleTypes.HORIZON)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api'
import { debounce } from 'lodash'
import { ref } from 'vue'
import { currentCar, haveCurrentCar } from '../shared/index'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const horizonAngle = ref(0)
const verticalAngle = ref(0)

const angleTypes = {
  HORIZON: 'horizon',
  VERTICAL: 'vertical'
}

const keyMap = {
  UP: '08',
  LEFT: '04',
  SWITCH: '255',
  RIGHT: '02',
  DOWN: '16'
}

function onClick(value: string) {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: '02',
      param2: value,
      param3: 0,
      param4: 0
    }
    patrolingCruise(data)
  }
}
const changeHorizonAngle = createDebouce('75', horizonAngle)

const changeVerticalAngle = createDebouce('77', verticalAngle)

function createDebouce(param2: string, ref: Ref<number>) {
  return debounce(async () => {
    if (haveCurrentCar()) {
      const data = {
        code: currentCar.value,
        param1: '01',
        param2: param2,
        param3: ref.value.toString(),
        param4: 'ff'
      }
      patrolingCruise(data)
    }
  }, 500)
}
function handleChangeAngle(type: string) {
  if (type === angleTypes.HORIZON) {
    changeHorizonAngle()
  } else if (type === angleTypes.VERTICAL) {
    changeVerticalAngle()
  }
}
</script>
