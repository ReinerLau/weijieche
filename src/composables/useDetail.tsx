import CameraPlayer from '@/components/CameraPlayer.vue'
import {
  baseModes,
  cameraList,
  cameraUrl,
  currentController,
  currentControllerType,
  modes
} from '@/shared'
import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElDrawer,
  ElOption,
  ElScrollbar,
  ElSelect
} from 'element-plus'
import type { Ref } from 'vue'
import { Fragment, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { detailDrawerVisible, getDetailDrawer, statusData } from './carDetail'
import { useController } from './useController'

// 底部状态相关
export const useDetail = ({ isMobile }: { isMobile: Ref<boolean> }) => {
  // 国际化
  const { t } = useI18n()

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
    ControllerMapDialog,
    controllerMapDialogVisible,
    direction,
    connectControlPan
  } = useController()

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
          <ElButton onClick={connectControlPan}>连接中控台</ElButton>
        </div>
      )
    },
    // {
    //   title: t('mo-ren-che-su'),
    //   slot: () => (
    //     <div class="flex ">
    //       <ElInputNumber v-model={carSpeed.value} min={0} />
    //       <ElButton onClick={() => settingCarSpeed(carSpeed.value)}>
    //         {t('she-zhi-mo-ren-che-su')}
    //       </ElButton>
    //     </div>
    //   )
    // },
    {
      // title: `${t('su-du')}: ${gear.value ? t('qian-jin') : t('hou-tui')}`,
      title: t('su-du'),
      value: speed.value
    },
    {
      title: t('zhuan-xiang'),
      value: direction.value
    },
    {
      title: t('dang-qian-che-su'),
      value: `${statusData.value.currentSpeed || 0}m/s`
    },
    {
      title: t('dian-liang'),
      value: `${statusData.value.battery || 0}%`
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
    },
    {
      title: t('dang-wei'),
      value: statusData.value.gearTarget
        ? statusData.value.gearTarget === 1
          ? 'N'
          : statusData.value.gearTarget === 2
          ? 'R'
          : statusData.value.gearTarget === 3
          ? 'N'
          : 'D'
        : t('wu-xiao')
    },
    {
      title: t('zhi-dong-deng'),
      value: statusData.value.brakeLightActual ? t('kai-qi') : t('guan-bi')
    },
    {
      title: t('qian-zhao-deng'),
      value: statusData.value.headlightActual ? t('kai-qi') : t('guan-bi')
    },

    {
      title: t('qian-zuo-lun-su'),
      value: statusData.value.wheelSpeedFL || 0
    },
    {
      title: t('qian-you-lun-su'),
      value: statusData.value.wheelSpeedFR || 0
    },
    {
      title: t('qu-niao'),
      value: statusData.value.drivingBird ? t('kai-qi') : t('wu')
    },
    {
      title: t('hou-zuo-lun-su'),
      value: statusData.value.wheelSpeedRL || 0
    },
    {
      title: t('hou-you-lun-su'),
      value: statusData.value.wheelSpeedRR || 0
    },

    {
      title: t('fang-xiang-pan-zhuan-jiao-kong-zhi'),
      value: statusData.value.steerAngleTarget || 0
    },

    {
      title: t('qu-dong-fang-shi'),
      value: statusData.value.driveModeStatus
        ? t('su-du-kong-zhi-mo-shi')
        : t('you-men-ta-ban-mo-shi')
    },
    {
      title: t('zhuan-xiang-kong-zhi-fang-shi'),
      value: statusData.value.steerModeStatus
        ? statusData.value.steerModeStatus === 1
          ? t('qian-hou-zhuan-xiang-yi-xiang')
          : t('qian-hou-zhuan-xiang-tong-xiang-mo-shi')
        : t('qian-zhuan-xiang-mo-shi')
    },
    {
      title: t('che-liang-mo-shi-zhuang-tai'),
      value: statusData.value.vehicleModeState
        ? statusData.value.vehicleModeState === 1
          ? t('zi-dong-jia-shi-mo-shi')
          : statusData.value.vehicleModeState === 2
          ? t('ji-ting-chu-fa')
          : t('dai-ji-mo-shi')
        : t('yao-kong-jia-shi-mo-shi')
    },
    {
      title: t('zhu-che-mo-shi'),
      value: statusData.value.parkTarget ? t('song-kai-zhu-che') : t('zhu-che')
    },
    {
      title: t('zhi-dong-zhi-fan-kui'),
      value: `${statusData.value.brakePedalActual || 0}%`
    },
    {
      title: t('ta-ban-qing-qiu-zhi-fan-kui'),
      value: `${statusData.value.driveThrottlePedalActual || 0}%`
    },
    {
      title: t('zi-dong-jia-shi-zhi-dong-kong-zhi-xin-hao-zhuang-tai'),
      value: statusData.value.brakeFlt2 ? t('kong-zhi-ming-ling-duan-kai') : t('zheng-chang')
    },
    {
      title: t('zi-dong-jia-shi-zhuan-xiang-kong-zhi-xin-hao-zhuang-tai'),
      value: statusData.value.steerFlt2 ? t('kong-zhi-ming-ling-duan-kai') : t('zheng-chang')
    },
    {
      title: t('di-pan-gu-zhang-zhuang-tai'),
      value: statusData.value.vehicleErrorCode || 0
    },
    {
      title: t('zhuan-xiang-deng-zhuang-tai'),
      value: statusData.value.turnLightActual
        ? statusData.value.turnLightActual === 1
          ? t('zuo-zhuan')
          : statusData.value.turnLightActual === 2
          ? t('you-zhuan')
          : t('shuang-shan')
        : t('guan-bi')
    },
    {
      title: t('zhi-dong-xi-tong-ying-jian-gu-zhang'),
      value: statusData.value.brakeFlt1 ? t('you-gu-zhang') : t('wu-gu-zhang')
    },
    {
      title: t('qu-dong-xi-tong-ying-jian-gu-zhang'),
      value: statusData.value.driveFlt1 ? t('you-gu-zhang') : t('wu-gu-zhang')
    },
    {
      title: t('dang-wei-gu-zhang'),
      value: statusData.value.gearFlt1
        ? t('zi-dong-jia-shi-dang-wei-kong-zhi-xin-hao-diu-shi-huo-huan-dang-shi-bai')
        : t('wu-gu-zhang')
    },
    {
      title: t('zhu-che-gu-zhang'),
      value: statusData.value.gearFlt2
        ? t('zi-dong-jia-shi-zhu-che-kong-zhi-xin-hao')
        : t('wu-gu-zhang')
    },

    {
      title: t('zhuan-xiang-xi-tong-ying-jian-gu-zhang'),
      value: statusData.value.steerFlt1 ? t('you-gu-zhang') : t('wu-gu-zhang')
    },
    {
      title: t('zi-dong-jia-shi-qu-dong-kong-zhi-tong-xun-duan-kai'),
      value: statusData.value.driveFlt2 ? t('kong-zhi-ming-ling-duan-kai') : t('zheng-chang')
    },
    {
      title: t('gen-sui'),
      value: statusData.value.isFollow ? t('gen-sui') : t('wu')
    },
    {
      title: t('xun-luo'),
      value: statusData.value.isPatrol ? t('xun-luo') : t('wu')
    },

    {
      title: t('wu-xian-han-hua'),
      value: statusData.value.wirelessShouting ? t('kai-qi') : t('wu')
    },
    {
      title: t('wen-du'),
      value: ` ${statusData.value.temperature || 0}°`
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
    }
  ])

  // 每次打开底部抽屉重新获取数据
  watch(detailDrawerVisible, (value: boolean) => {
    getDetailDrawer(value)
  })

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
    DetailSection
  }
}
