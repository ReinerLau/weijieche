<template>
  <div>
    <div class="text-white mb-7">{{ t('qu-niao-qi-kong-zhi') }}</div>
    <div class="grid gap-2 grid-cols-5 grid-rows-2 w-full h-14 mr-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="onClick(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-center items-center">
      <span class="text-white mr-5">{{ t('yin-liang') }}</span>
      <el-slider
        v-model="volume"
        class="flex-1"
        :step="1"
        :min="1"
        :max="30"
        :show-input-controls="false"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 驱鸟器控制
import { patrolingCruise, playAudioById } from '@/api'
import { controllerTypes, currentCar, currentControllerType, haveCurrentCar } from '@/shared'
import { debounce } from 'lodash'
import { computed, ref, watch } from 'vue'
import { pressedButtons } from '@/shared'
import type { ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

// 国际化
const { t } = useI18n()

// 按钮组合
const buttonList = [
  // {
  //   value: '01',
  //   content: t('qu-niao')
  // },
  {
    value: '9',
    content: t('qu-niao')
  },
  // {
  //   value: '02',
  //   content: t('qu-ren')
  // },
  {
    value: '10',
    content: t('qu-ren')
  },
  // {
  //   value: '08',
  //   content: t('zan-ting')
  // },
  {
    value: '08',
    content: t('jie-shu-bo-fang')
  },
  {
    value: '05',
    content: t('shi-neng')
  },
  {
    value: '06',
    content: t('shi-neng-0')
  }
]

// 点击按钮
async function onClick(value: string) {
  if (haveCurrentCar()) {
    if (value === '9' || value === '10') {
      playAudioById(parseInt(value))
    } else {
      const data = {
        code: currentCar.value,
        param1: '05',
        param2: value,
        param3: '255',
        param4: 'ff'
      }
      patrolingCruise(data)
    }
  }
}

// 音量值
const volume = ref(0)
// 修改音量
const changeVolumn = debounce(async () => {
  if (haveCurrentCar()) {
    const data = {
      code: currentCar.value,
      param1: '05',
      param2: '04',
      param3: volume.value,
      param4: 'ff'
    }
    patrolingCruise(data)
  }
}, 500)

// 驱鸟功能是否开启
const playBirdAway = ref(false)
// 驱人功能是否开启
const playPersonAway = ref(false)

// 切换按钮事件
const switchEvent = {
  PERSON: () => {
    playPersonAway.value = !playPersonAway.value
    if (playPersonAway.value) {
      if (haveCurrentCar()) {
        onClick('10')
      }
    } else {
      onClick('08')
    }
  },
  BIRD: () => {
    playBirdAway.value = !playBirdAway.value
    if (playPersonAway.value) {
      if (haveCurrentCar()) {
        onClick('9')
      }
    } else {
      onClick('08')
    }
  }
}

// 不同控制器按钮对应的功能映射
const actionMap: ComputedRef<any[]> = computed(() => {
  const actions = new Array(20)
  if (currentControllerType.value === controllerTypes.value.WHEEL) {
    actions[0] = switchEvent.PERSON
    actions[2] = switchEvent.BIRD
    return actions
  } else if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
    actions[1] = switchEvent.BIRD
    actions[2] = switchEvent.PERSON
    return actions
  } else {
    return actions
  }
})

// 监听控制器按钮触发功能
watch(pressedButtons, (val) => {
  if (val !== -1) {
    console.log(val)
    const actionGetter = actionMap.value[val]
    actionGetter && actionGetter()
  }
})

// 修改音量
function handleChange() {
  changeVolumn()
}
</script>
