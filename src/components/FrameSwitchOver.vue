<template>
  <div>
    <div class="text-white mb-7">全屏画面切换</div>
    <div class="flex justify-between">
      <el-button size="large" circle>
        <i-icomoon-free-switch />
      </el-button>
      <el-button size="large" circle>返回</el-button>
    </div>
    <div class="flex justify-center mb-7">
      <div
        :class="[
          'border',
          'border-solid',
          ' border-white',
          'rounded-full',
          'flex',
          'flex-col',
          'justify-center',
          'w-24',
          'h-24',
          'items-center',
          'text-white',
          'cursor-pointer',
          'select-none',
          'active:bg-sky-700',
          'focus:bg-sky-500'
        ]"
      >
        <div class="flex-1 flex items-center justify-center">
          <i-bxs-up-arrow />
        </div>
        <div class="flex-1 flex items-center w-full">
          <div class="flex-1 flex justify-center">
            <i-bxs-left-arrow />
          </div>
          <div class="flex-1 h-full">
            <el-button size="large" circle>确认</el-button>
          </div>
          <div class="flex-1 flex justify-center">
            <i-bxs-right-arrow />
          </div>
        </div>
        <div class="flex-1 flex items-center justify-center">
          <i-bxs-down-arrow />
        </div>
      </div>
    </div>
    <div class="flex justify-between mb-7">
      <el-button size="large" circle>
        <i-vaadin-time-backward />
      </el-button>
      <el-button size="large" circle>AV1</el-button>
      <el-button size="large" circle>AV2</el-button>
    </div>
    <div class="flex justify-center">
      <div class="flex-1 flex justify-center">
        <el-button size="large" circle>AV3</el-button>
      </div>
      <div class="flex-1 flex justify-center">
        <el-button size="large" circle>AV4</el-button>
      </div>
    </div>
  </div>
</template>
