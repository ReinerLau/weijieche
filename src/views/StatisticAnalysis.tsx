import { ElCard, ElCol, ElRow, type DateModelType, type DateOrDates, dayjs } from 'element-plus'
import { computed, defineComponent, onMounted, watch } from 'vue'
import { useTimePicker } from '@/composables/useTimePicker'
import { useChartLine } from '@/composables/useChartLine'
import { usePieChart } from '@/composables/useChartPie'
import { useChartBar } from '@/composables/useChartBar'
import { getPatrolData, getErrorData } from '@/api/charts'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'StatisticAnalysis',
  setup() {
    // 国际化
    const { t } = useI18n()
    const { TimePicker, queryTime, queryTimeType } = useTimePicker()
    const { PatrolChart, AbnormalChart, updateLineData, initChart } = useChartLine()
    const { PieChart, updatePieChart, initPieChart } = usePieChart()
    const { BarChart, updateBarChart, initBarChart } = useChartBar()
    const params = computed(() => ({
      ...handleQueryTimeChange(queryTime.value)
    }))

    watch(queryTime, () => {
      getChartData()
    })

    function handleQueryTimeChange(val: DateModelType | DateOrDates): {
      startTime: string | null
      endTime: string | null
    } {
      let startTime: string | null
      let endTime: string | null
      if (!val) {
        startTime = null
        endTime = null
      } else if (Array.isArray(val)) {
        startTime = dayjs(val[0]).startOf('date').format('YYYY-MM-DD HH:mm:ss')
        endTime = dayjs(val[1]).endOf('date').format('YYYY-MM-DD HH:mm:ss')
      } else {
        startTime = dayjs(val).startOf(queryTimeType.value).format('YYYY-MM-DD HH:mm:ss')
        endTime = dayjs(val).endOf(queryTimeType.value).format('YYYY-MM-DD HH:mm:ss')
      }

      return { startTime, endTime }
    }

    async function getChartData() {
      if (params.value.startTime && params.value.endTime) {
        const lineRes = await getPatrolData(params.value.startTime, params.value.endTime)
        const errorRes = await getErrorData(params.value.startTime, params.value.endTime)
        const patrolResData = {
          title: t('xun-luo-ren-wu-ci-shu'),
          data: lineRes.data
        }
        const abnormalResData = {
          title1: t('yi-chang-zong-shu'),
          title2: `${
            queryTimeType.value === 'year'
              ? t('shang-nian')
              : queryTimeType.value === 'week'
              ? t('shang-zhou')
              : queryTimeType.value === 'month'
              ? t('shang-yue')
              : queryTimeType.value === 'date'
              ? t('zuo-tian')
              : t('shang-ge-shi-jian-duan')
          }`,
          data: lineRes.data,
          abnormalNum: errorRes.data !== null ? errorRes.data.compare : 0
        }
        if (lineRes.data.length === 0) {
          initChart()
        } else {
          updateLineData(patrolResData, abnormalResData)
        }

        if (errorRes.data) {
          updatePieChart(errorRes.data)
          updateBarChart(errorRes.data)
        } else {
          initPieChart()
          initBarChart()
        }
      }
    }
    onMounted(() => {
      getChartData()
    })

    return () => (
      <div class=" h-[100vh]  p-4 box-border">
        <div class="grid gap-4">
          <TimePicker v-model:type={queryTimeType.value} v-model={queryTime.value}></TimePicker>
          <ElRow gutter={20}>
            <ElCol span={13}>
              <ElCard header={t('xun-luo-ci-shu-zhe-xian-tu')}>
                <PatrolChart />
              </ElCard>
            </ElCol>
            <ElCol span={11}>
              <ElCard header={t('yi-chang-qing-kuang-zhu-zhuang-tu')}>
                <BarChart />
              </ElCard>
            </ElCol>
          </ElRow>
          <ElRow gutter={20}>
            <ElCol span={13}>
              <ElCard header={t('yi-chang-qing-kuang-dui-bi-qu-shi-tu')}>
                <AbnormalChart />
              </ElCard>
            </ElCol>
            <ElCol span={11} class="">
              <ElCard header={t('yi-chang-qing-kuang-lei-xing-zhan-bi-tu')}>
                <PieChart />
              </ElCard>
            </ElCol>
          </ElRow>
        </div>
      </div>
    )
  }
})
