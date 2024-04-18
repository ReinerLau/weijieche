import { getCarInfo, updateCarSpeed } from '@/api'
import CameraPlayer from '@/components/CameraPlayer.vue'
import {
  baseModes,
  cameraList,
  cameraUrl,
  currentCar,
  currentController,
  currentControllerType,
  haveCurrentCar,
  modes,
  pressedButtons
} from '@/shared'
import { getLineCoordinates } from '@/shared/map'
import { pathPoints, pathPointsData } from '@/shared/map/path'
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDrawer,
  ElInputNumber,
  ElMessage,
  ElOption,
  ElScrollbar,
  ElSelect
} from 'element-plus'
import type { Ref } from 'vue'
import { Fragment, computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useController } from './useController'

//默认车速变量
export const carSpeed = ref(0)

// 底部状态相关
export const useDetail = ({ isMobile }: { isMobile: Ref<boolean> }) => {
  // 国际化
  const { t } = useI18n()

  // 底部抽屉是否可见
  const detailDrawerVisible = ref(false)

  // 车辆模式文字映射
  const modeText = {
    [modes.AUTO]: t('zi-zhu'),
    [modes.MANUAL]: t('shou-dong'),
    [modes.STOP]: t('ting-zhi')
    // [modes.AUTODEBLOCKING]: t('zi-zhu-jie-suo'),
    // [modes.STOPLOCK]: t('ting-zhi-shang-suo')
  }

  // 当前模式显示的文字
  const mode = computed(() => {
    return modeText[statusData.value.customMode] || t('wei-zhi')
  })

  // 底盘模式文字映射
  const baseModeText = {
    [baseModes.AUTO]: t('jie-suo'),
    [baseModes.MANUAL]: t('jie-suo'),
    [baseModes.STOP]: t('suo-ding')
  }

  // 当前底盘模式
  const baseMode = computed(() => {
    return baseModeText[statusData.value.baseMode] || t('wei-zhi')
  })

  // 手柄、方向盘相关逻辑
  const {
    controllers,
    controllerTypes,
    speed,
    gear,
    ControllerMapDialog,
    controllerMapDialogVisible,
    direction
  } = useController(currentCar)

  // 监听前进后退的切换按键
  watch(pressedButtons, (val) => {
    if (currentControllerType.value === controllerTypes.value.WHEEL) {
      if (val === 6) {
        gear.value = !gear.value
      }
    } else if (currentControllerType.value === controllerTypes.value.GAMEPAD) {
      if (val === 5) {
        gear.value = !gear.value
      }
    }
  })

  //设置默认车速
  async function settingCarSpeed(speed: number) {
    carSpeed.value = speed
    try {
      const res: any = await updateCarSpeed({ code: currentCar.value, speed: carSpeed.value })
      ElMessage({
        type: 'success',
        message: res.message
      })
    } catch {
      ElMessage({
        type: 'error',
        message: t('che-su-xiu-gai-shi-bai')
      })
    }
  }

  //默认速度改变，路线默认速度重置
  watch(carSpeed, () => {
    pathPointsData.value = getLineCoordinates(pathPoints)
  })

  // 所有状态值
  const status = computed(() => [
    {
      title: t('mo-shi'),
      value: mode.value
    },
    {
      title: t('di-pan'),
      value: baseMode.value
    },
    {
      title: t('kong-zhi-qi'),
      slot: () => (
        <div class="flex flex-col">
          <ElSelect v-model={currentController.value} placeholder={t('qing-xuan-ze-kong-zhi-qi')}>
            {controllers.value.map((item) => (
              <ElOption key={item.id} label={item.id} value={item.id}></ElOption>
            ))}
          </ElSelect>
          <ElSelect
            v-model={currentControllerType.value}
            placeholder={t('qing-xuan-ze-kong-zhi-qi-lei-xing')}
          >
            {Object.entries(controllerTypes.value).map(([key, value]) => (
              <ElOption
                key={key}
                label={key === 'GAMEPAD' ? t('shou-bing') : t('fang-xiang-pan')}
                value={value}
              ></ElOption>
            ))}
          </ElSelect>
          <ElButton onClick={() => (controllerMapDialogVisible.value = true)}>
            {t('she-zhi-ying-she')}
          </ElButton>
        </div>
      )
    },
    {
      title: t('mo-ren-che-su'),
      slot: () => (
        <div class="flex ">
          <ElInputNumber v-model={carSpeed.value} min={0} />
          <ElButton onClick={() => settingCarSpeed(carSpeed.value)}>
            {t('she-zhi-mo-ren-che-su')}
          </ElButton>
        </div>
      )
    },
    {
      title: `${t('su-du')}: ${gear.value ? t('qian-jin') : t('hou-tui')}`,
      value: speed.value
    },
    {
      title: t('zhuan-xiang'),
      value: direction.value
    },
    {
      title: t('dian-liang'),
      value: `${statusData.value.battery || 0}%`
    },
    {
      title: t('wen-du'),
      value: statusData.value.temperature || 0
    },
    {
      title: t('shi-du'),
      value: `${statusData.value.humidity || 0}%`
    },
    {
      title: t('huo-yan'),
      value: statusData.value.blaze ? t('you-huo-yan') : t('wu-huo-yan')
    },
    {
      title: t('zao-yin'),
      value: `${statusData.value.noise || 0}DB`
    },
    {
      title: t('yan-wu'),
      value: statusData.value.smoke ? t('you-yan-wu') : t('wu-yan-wu')
    },
    {
      title: 'PM2.5',
      value: `${statusData.value.pm || 0}ug/m`
    },
    {
      title: 'PM10',
      value: `${statusData.value.pm10 || 0}ug/m³`
    },
    {
      title: t('liu-hua-qing'),
      value: `${statusData.value.h2S || 0}ug/m³`
    },
    {
      title: t('jia-wan'),
      value: `${statusData.value.ch4 || 0}ug/m³`
    },
    {
      title: t('yi-yang-hua-tan'),
      value: `${statusData.value.co || 0}ug/m³`
    },
    {
      title: t('zhao-du-ji'),
      value: `${statusData.value.lightNum || 0}Lux`
    },
    {
      title: t('yu-liang-ji'),
      value: `${statusData.value.rainfallNum || 0}ppm`
    },
    {
      title: t('yun-tai-shui-ping-jiao-du'),
      value: `${
        statusData.value.ptzAngleHorizontal === -3
          ? t('wei-fa-xian-yun-tai-huo-sun-huai')
          : `${statusData.value.ptzAngleHorizontal || 0}°`
      }`
    },
    {
      title: t('yun-tai-chui-zhi-jiao-du'),
      value: `${
        statusData.value.ptzAngleVertical === -3
          ? t('wei-fa-xian-yun-tai-huo-sun-huai')
          : ` ${statusData.value.ptzAngleVertical || 0}°`
      }`
    }
  ])

  // 状态数据
  const statusData: Ref<Record<string, any>> = ref({})
  let intervalId: any
  // 每次打开底部抽屉重新获取数据
  watch(detailDrawerVisible, async (value: boolean) => {
    if (haveCurrentCar()) {
      clearInterval(intervalId)
      intervalId = null
      updateData()
      intervalId = setInterval(async () => {
        updateData()
      }, 1000)
    }
    if (!value) {
      if (intervalId) {
        // 抽屉关闭时停止定时获取数据
        clearInterval(intervalId)
        intervalId = null
      }
      return
    }
  })

  async function updateData() {
    const res = await getCarInfo(currentCar.value)
    statusData.value = res.data
  }
  // 视频监控区域组件
  const CameraSection = () =>
    cameraList.value.length === 0 ? null : (
      <Fragment>
        {/* {cameraList.value.map((item) => (
        <div class="bg-black h-60" key={item.id}>
          <CameraPlayer url={item.rtsp} />
        </div>
      ))
      } */}
        {
          <ElSelect
            v-model={cameraUrl.value}
            class="m-2"
            placeholder={t('shi-pin-qie-huan')}
            size="large"
          >
            {cameraList.value.map((item) => (
              <ElOption key={item.id} label={item.name} value={item.rtsp} />
            ))}
          </ElSelect>
        }
        {
          <div class="bg-black h-60">
            <CameraPlayer url={cameraUrl.value} />
          </div>
        }
      </Fragment>
    )

  // 底部抽屉组件
  const DetailSection = () => (
    <ElDrawer
      title={t('xiang-qing')}
      class="select-none"
      v-model={detailDrawerVisible.value}
      direction="btt"
      size="65%"
    >
      <ElScrollbar>
        <ElDescriptions border={true} direction="vertical">
          {status.value.map((item) => (
            <ElDescriptionsItem key={item.title} label={item.title}>
              {(item.slot && item.slot()) || item.value}
            </ElDescriptionsItem>
          ))}
        </ElDescriptions>
        {isMobile.value ? <CameraSection /> : null}
      </ElScrollbar>
      <ControllerMapDialog />
    </ElDrawer>
  )
  return {
    DetailSection,
    detailDrawerVisible
  }
}
