<template>
  <video ref="videoRef" class="w-full h-full" autoplay muted controls loop />
</template>

<script setup lang="ts">
// https://www.npmjs.com/package/rtc-streamer
import { SrsRtcPlayerAsync } from 'rtc-streamer'
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

const props = defineProps<{ url: string }>()

// 播放器 dom 元素
const videoRef: Ref<HTMLVideoElement | undefined> = ref()

// srs 拉流实例
let srs = new SrsRtcPlayerAsync()

// 监听拉流地址变成重新拉流
watch(
  () => props.url,
  () => {
    initPlay()
  }
)

onMounted(() => {
  initPlay()
})

/**
 * 拉流
 */
function initPlay() {
  srs.close()
  srs = new SrsRtcPlayerAsync()
  if (videoRef.value && props.url) {
    videoRef.value.srcObject = srs.stream
    srs.play(props.url)
  }
}

// 关闭拉流
onBeforeUnmount(() => {
  if (srs) {
    srs.close()
  }
})

defineExpose({
  initPlay
})
</script>
