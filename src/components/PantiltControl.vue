<template>
  <div>
    <div class="text-white">云台控制</div>
    <div class="flex justify-center">
      <div class="w-48">
        <div class="flex justify-center">
          <el-button size="large">
            <i-bxs-up-arrow />
          </el-button>
        </div>
        <div class="flex justify-between">
          <el-button size="large">
            <i-bxs-left-arrow />
          </el-button>
          <el-button size="large">
            <i-icomoon-free-switch />
          </el-button>
          <el-button size="large">
            <i-bxs-right-arrow />
          </el-button>
        </div>
        <div class="flex justify-center">
          <el-button size="large">
            <i-bxs-down-arrow />
          </el-button>
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-col justify-around">
      <div class="flex text-white items-center">
        <span class="w-24">水平角度</span>
        <el-slider class="flex-1" :step="1" :min="-180" :max="180" :show-input-controls="false" />
      </div>
      <div class="flex text-white items-center">
        <span class="w-24">垂直角度</span>
        <el-slider class="flex-1" :step="1" :min="-180" :max="180" :show-input-controls="false" />
      </div>
    </div>
  </div>
</template>
