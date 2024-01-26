import { onMounted, onUnmounted, ref, type FunctionalComponent, type Ref } from 'vue'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'

//折线图
interface LineResData {
  taskDateCount: number
  timePeriod: string
  errorDateCount: number
  dateCompare: number
}

export const useChartLine = () => {
  //  国际化
  const { t } = useI18n()

  const chartPatrolRef: Ref<HTMLElement | undefined> = ref()
  const chartAbnormalRef: Ref<HTMLElement | undefined> = ref()

  let patrolChart: echarts.ECharts
  let abnormalChart: echarts.ECharts

  function initChart(abnormalname: string) {
    if (patrolChart) {
      patrolChart.dispose()
    }

    if (abnormalChart) {
      abnormalChart.dispose()
    }

    patrolChart = echarts.init(chartPatrolRef.value)
    abnormalChart = echarts.init(chartAbnormalRef.value)

    const patrolLineOption = generateLineOption(false, abnormalname)

    patrolChart.setOption(patrolLineOption)

    const abnormalLineOption = generateLineOption(true, abnormalname)
    abnormalChart.setOption(abnormalLineOption)
  }

  function generateLineOption(isAbnormal = false, abnormalname: string) {
    const lineOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            width: 1,
            color: '#019680'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
        splitLine: {
          show: true,
          lineStyle: {
            width: 1,
            type: 'solid',
            color: 'rgba(226,226,226,0.5)'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#78D4FF'
        }
      },
      yAxis: [
        {
          type: 'value',
          axisTick: {
            show: false
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)']
            }
          },
          axisLabel: {
            color: '#78D4FF'
          }
        }
      ],
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        containLabel: true
      },
      series: [
        {
          name: isAbnormal ? '异常数' : t('xun-luo-ren-wu-ci-shu'),
          smooth: true,
          data: Array(30).fill(0),
          type: 'line',
          areaStyle: {},
          itemStyle: {
            color: isAbnormal ? '#ee6666' : '#73c0de'
          }
        }
      ]
    }

    if (isAbnormal) {
      lineOption.series.push({
        name: abnormalname + '异常数',
        smooth: true,
        data: Array(30).fill(0),
        type: 'line',
        areaStyle: {},
        itemStyle: {
          color: ''
        }
      })
    }
    return lineOption
  }

  function handleResize() {
    patrolChart.resize()
    abnormalChart.resize()
  }

  function updateLineData(abnormaldata: {
    name: string
    data: LineResData[]
    abnormalNum: number
    errorCount: number
  }) {
    //巡逻次数
    let lineChartPatrolData: { taskDateCounts: number[]; timePeriods: string[] } = {
      taskDateCounts: [],
      timePeriods: []
    }
    lineChartPatrolData = abnormaldata.data.reduce((acc, item) => {
      if (item.taskDateCount !== null && item.taskDateCount !== 0) {
        acc.taskDateCounts.push(item.taskDateCount)
        acc.timePeriods.push(item.timePeriod)
      }
      return acc
    }, lineChartPatrolData)

    patrolChart.setOption({
      xAxis: {
        data: lineChartPatrolData.timePeriods
      },
      series: [
        {
          name: t('xun-luo-ren-wu-ci-shu'),
          data:
            lineChartPatrolData.taskDateCounts.length === 0
              ? [0]
              : lineChartPatrolData.taskDateCounts
        }
      ]
    })

    // 异常情况
    let lineChartAbnormalData: {
      errorDateCounts: number[]
      compares: number[]
      timePeriods: string[]
      errorCounts: number[]
      dateCompares: number[]
    } = {
      errorDateCounts: [],
      compares: [],
      timePeriods: [],
      errorCounts: [],
      dateCompares: []
    }
    lineChartAbnormalData = abnormaldata.data.reduce((acc, item) => {
      if (item.errorDateCount !== null) {
        acc.errorDateCounts.push(item.errorDateCount)
        acc.compares.push(abnormaldata.abnormalNum)
        acc.timePeriods.push(item.timePeriod)
        acc.errorCounts.push(abnormaldata.errorCount)
        acc.dateCompares.push(item.dateCompare === null ? 0 : item.dateCompare)
      }
      return acc
    }, lineChartAbnormalData)

    abnormalChart.setOption({
      xAxis: {
        data: lineChartAbnormalData.timePeriods
      },

      //当前时间异常数
      //当前时间段异常总数
      //上个时间段异常总数
      //对比上个时间段异常数
      series: [
        {
          name: '异常数',
          data:
            lineChartAbnormalData.errorDateCounts.length === 0
              ? [0]
              : lineChartAbnormalData.errorDateCounts
        },
        // {
        //   name: abnormaldata.name,
        //   data: lineChartAbnormalData.compares
        // },
        // {
        //   name: '异常总数',
        //   data: lineChartAbnormalData.errorCounts
        // },
        {
          name: abnormaldata.name + '异常数',
          data:
            lineChartAbnormalData.dateCompares.length === 0
              ? [0]
              : lineChartAbnormalData.dateCompares
        }
      ]
    })
  }

  onMounted(() => {
    initChart('')
    window.addEventListener('resize', handleResize)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  const PatrolChart: FunctionalComponent = () => {
    return <div ref={chartPatrolRef} class=" h-64 w-full" />
  }

  const AbnormalChart: FunctionalComponent = () => {
    return <div ref={chartAbnormalRef} class=" h-64 w-full" />
  }

  return {
    PatrolChart,
    updateLineData,
    AbnormalChart,
    initChart
  }
}
