import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref, type FunctionalComponent, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

//异常类型占比-饼图
interface PieResData {
  hole: number
  personnelIntrusion: number
  salute: number
}

export const usePieChart = () => {
  // 国际化
  const { t } = useI18n()
  const chartRef: Ref<HTMLElement | undefined> = ref()

  let chart: echarts.ECharts

  function initPieChart() {
    if (chart) {
      chart.dispose()
    }
    chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        left: 'center',
        textStyle: {
          color: 'bold'
        }
      },
      series: [
        {
          name: t('yi-chang-qing-kuang'),
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          color: ['#5ab1ef', '#b6a2de', '#67e0e3'],
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              // show: true,
              // fontSize: 12,
              // fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              name: t('tie-si-wang-shi-bie'),
              value: 0
            },
            {
              name: t('ren-yuan-ru-qin'),
              value: 0
            },
            {
              name: t('wu-ren-zhi-ban'),
              value: 0
            }
          ],
          roseType: 'radius',
          animationType: 'scale',
          animationEasing: 'exponentialInOut'
        }
      ]
    })
  }

  function updatePieChart(data: PieResData) {
    const { hole, personnelIntrusion, salute } = data
    const pieChartData = [
      {
        name: t('tie-si-wang-shi-bie'),
        value: hole === null ? 0 : hole
      },
      {
        name: t('ren-yuan-ru-qin'),
        value: personnelIntrusion === null ? 0 : personnelIntrusion
      },
      {
        name: t('wu-ren-zhi-ban'),
        value: salute === null ? 0 : salute
      }
    ]

    chart.setOption({
      series: [
        {
          data: pieChartData
        }
      ]
    })
  }

  function handleResize() {
    chart.resize()
  }

  onMounted(() => {
    initPieChart()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  const PieChart: FunctionalComponent = () => {
    return <div ref={chartRef} class="h-64 w-full" />
  }

  return {
    PieChart,
    updatePieChart,
    initPieChart
  }
}
