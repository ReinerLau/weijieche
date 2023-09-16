<template>
  <div>
    <div class="text-white">云台控制</div>
    <div class="flex justify-center">
      <el-row class="w-48">
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full">
            <i-bxs-up-arrow />
          </el-button>
        </el-col>
        <el-row class="w-full">
          <el-col :span="8">
            <el-button size="large" class="w-full">
              <i-bxs-left-arrow />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full">
              <i-icomoon-free-switch />
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button size="large" class="w-full">
              <i-bxs-right-arrow />
            </el-button>
          </el-col>
        </el-row>
        <el-col :span="8" :offset="8">
          <el-button size="large" class="w-full">
            <i-bxs-down-arrow />
          </el-button>
        </el-col>
      </el-row>
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
