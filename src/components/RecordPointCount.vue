<template>
  <div
    v-if="isRecordPath || isRecord"
    class="fixed rounded-md bg-[#072233] opacity-60 flex flex-col p-4"
  >
    <div class="flex">
      <div class="w-28 text-right">录制总点数：</div>
      <div>
        {{ allRecordSum }}
      </div>
    </div>
    <div class="flex">
      <div class="w-28 text-right">实际录制点数：</div>
      <div>{{ filterRecordSum }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { allRecordSum, filterRecordSum, isRecord, isRecordPath } from '@/shared/map/record'
</script>
