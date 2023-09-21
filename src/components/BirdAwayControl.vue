<template>
  <div>
    <div class="text-white mb-7">驱鸟器控制</div>
    <div class="grid gap-2 grid-cols-5 grid-rows-1 w-full h-14 mr-4">
      <template v-for="item in buttonList" :key="item.value">
        <el-button size="large" @click="onClick(item.value)">
          {{ item.content }}
        </el-button>
      </template>
    </div>
    <div class="flex justify-center items-center">
      <span class="text-white mr-5">音量</span>
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
import { patrolingCruise } from '@/api'
import { controllerTypes, currentCar, currentControllerType, haveCurrentCar } from '@/shared'
import { debounce } from 'lodash'
import { computed, ref, watch, type ComputedRef } from 'vue'
import { pressedButtons } from '../shared/index'

const buttonList = [
  {
    value: '01',
    content: '驱鸟'
  },
  {
    value: '02',
    content: '驱人'
  },
  {
    value: '03',
    content: '暂停'
  },
  {
    value: '05',
    content: '使能'
  },
  {
    value: '06',
    content: '失能'
  }
]

async function onClick(value: string) {
  if (haveCurrentCar()) {
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

const volume = ref(0)
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

const playBirdAway = ref(false)
const playPersonAway = ref(false)

const switchEvent = {
  PERSON: () => {
    playPersonAway.value = !playPersonAway.value
    if (playPersonAway.value) {
      onClick('02')
    } else {
      onClick('03')
    }
  },
  BIRD: () => {
    playBirdAway.value = !playBirdAway.value
    if (playPersonAway.value) {
      onClick('01')
    } else {
      onClick('03')
    }
  }
}

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

watch(pressedButtons, (val) => {
  if (val !== -1) {
    console.log(val)
    const actionGetter = actionMap.value[val]
    actionGetter && actionGetter()
  }
})

function handleChange() {
  changeVolumn()
}
</script>
