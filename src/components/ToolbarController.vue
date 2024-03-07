<script setup lang="ts">
interface ToolbarItem {
  title: string
  subItems?: ToolbarItem[]
  event?: () => void
}

defineProps<{
  items: ToolbarItem[]
}>()
</script>

<template>
  <div class="w-3/4 bg-[#0c2d46] border border-[#1c91c7] rounded p-2">
    <el-scrollbar>
      <div class="flex">
        <template v-for="(item, index) in items" :key="item.title">
          <el-dropdown v-if="item.subItems" class="flex-1">
            <template #default>
              <el-button link class="w-full" type="primary">{{ item.title }}</el-button>
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="subItem in item.subItems"
                  :key="subItem.title"
                  @click="subItem.event"
                  >{{ subItem.title }}</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else link class="flex-1" type="primary" @click="item.event">{{
            item.title
          }}</el-button>
          <span v-if="index !== items.length - 1" class="px-2 text-[#1c91c7]">|</span>
        </template>
      </div>
    </el-scrollbar>
  </div>
</template>
