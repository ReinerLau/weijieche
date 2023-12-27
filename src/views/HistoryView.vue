<script setup lang="ts">
import { usePatrolTask } from '@/composables'
const { PatrolTaskTable } = usePatrolTask()
</script>

<template>
  <el-container id="container" class="h-full p-4">
    <el-aside width="30vw">
      <PatrolTaskTable class="h-full" />
    </el-aside>
    <el-container>
      <el-header class="border-2 ml-4" height="15vh">Header</el-header>
      <el-main class="border-2 ml-4">Main</el-main>
      <el-footer class="border-2 ml-4" height="35vh">Footer</el-footer>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss"></style>
