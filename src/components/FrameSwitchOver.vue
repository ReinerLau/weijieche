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
