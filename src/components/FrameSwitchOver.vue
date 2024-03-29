<template>
  <div class="mb-7">{{ t('quan-ping-hua-mian-qie-huan') }}</div>
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
          <el-button class="w-full" size="large" @click="onClick(keyMap.BATTERY)">
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
  <el-row :gutter="8">
    <el-col :span="8">
      <el-button size="large" class="w-full" @click="onClick(keyMap.CONFIRM)">
        {{ t('que-ding') }}
      </el-button>
    </el-col>
    <el-col :span="8">
      <el-button class="w-full mb-2" size="large" @click="onClick(keyMap.BACK)">{{
        t('fan-hui')
      }}</el-button>
    </el-col>
    <el-col :span="8">
      <el-button class="w-full mb-2" size="large" @click="onClick(keyMap.AV1)">AV1</el-button>
    </el-col>
    <el-col :span="8">
      <el-button class="w-full" size="large" @click="onClick(keyMap.AV2)">AV2</el-button>
    </el-col>
    <el-col :span="8">
      <el-button class="w-full" size="large" @click="onClick(keyMap.AV3)">AV3</el-button>
    </el-col>
    <el-col :span="8">
      <el-button class="w-full" size="large" @click="onClick(keyMap.AV4)">AV4</el-button>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { patrolingCruise } from '@/api'
import { currentCar, haveCurrentCar } from '@/shared'
import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()

// 不同功能对应映射值
const keyMap = {
  BATTERY: 1,
  UP: 2,
  BACK: 3,
  LEFT: 4,
  CONFIRM: 5,
  RIGHT: 6,
  DOWN: 8,
  PREV: '12',
  AV1: 13,
  AV2: 14,
  AV3: 15,
  AV4: 16
}

// 开启功能
async function onClick(value: string | number) {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: 8,
      param2: value,
      param3: 0,
      param4: 0
    }
    patrolingCruise(data)
  }
}
</script>
