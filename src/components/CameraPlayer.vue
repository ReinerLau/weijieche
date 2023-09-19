<template>
  <video ref="videoRef" class="w-full h-full" autoplay muted controls loop />
</template>

<script setup lang="ts">
import { SrsRtcPlayerAsync } from 'rtc-streamer'
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

const props = defineProps<{ url: string }>()

const videoRef: Ref<HTMLVideoElement | undefined> = ref()
const srs = new SrsRtcPlayerAsync()

watch(
  () => props.url,
  () => {
    initPlay()
  }
)

onMounted(() => {
  initPlay()
})

function initPlay() {
  if (videoRef.value && props.url) {
    videoRef.value.srcObject = srs.stream
    srs.play(props.url)
  }
}

onBeforeUnmount(() => {
  if (srs) {
    srs.close()
  }
})
</script>
