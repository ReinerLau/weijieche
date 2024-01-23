import * as echarts from 'echarts'
import { onMounted, onUnmounted, type FunctionalComponent, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface PieResData {
  hole: number
  personnelIntrusion: number
  salute: number
}

export const useChartBar = () => {
  // 国际化
  const { t } = useI18n()
  const chartRef: Ref<HTMLElement | undefined> = ref()

  let chart: echarts.ECharts

  function initBarChart() {
    if (chart) {
      chart.dispose()
    }
    chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: [t('tie-si-wang-shi-bie'), t('ren-yuan-ru-qin'), t('wu-ren-zhi-ban')],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: t('yi-chang-shu'),
          type: 'bar',
          barWidth: '60%',
          data: [0, 0, 0]
        }
      ]
    })
  }

  function updateBarChart(data: PieResData) {
    const { hole, personnelIntrusion, salute } = data
    const barChartData = [
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
          data: barChartData
        }
      ]
    })
  }

  function handleResize() {
    chart.resize()
  }

  onMounted(() => {
    initBarChart()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  const BarChart: FunctionalComponent = () => {
    return <div ref={chartRef} class="h-72 w-full" />
  }

  return {
    BarChart,
    updateBarChart,
    initBarChart
  }
}
