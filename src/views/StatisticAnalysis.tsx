import {
  ElCard,
  ElCol,
  ElRow,
  type DateModelType,
  type DateOrDates,
  dayjs,
  ElContainer,
  ElMain,
  ElScrollbar
} from 'element-plus'
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
        const abnormalResData = {
          name: `${
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
          abnormalNum: errorRes.data !== null ? errorRes.data.compare : 0,
          errorCount: errorRes.data !== null ? errorRes.data.errorCount : 0
        }
        if (lineRes.data.length === 0) {
          initChart(abnormalResData.name)
        } else {
          updateLineData(abnormalResData)
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
      <ElContainer class="h-[100vh]  ">
        <ElMain>
          <div>
            <div class="min-h-[10vh] mb-3">
              <TimePicker v-model:type={queryTimeType.value} v-model={queryTime.value}></TimePicker>
            </div>
            <div class="h-full">
              <ElScrollbar height="82vh">
                <div class="grid gap-5 box-border">
                  <ElRow gutter={20}>
                    <ElCol span={18} xs={12}>
                      <ElCard
                        class=" whitespace-nowrap overflow-hidden text-ellipsis"
                        header={t('xun-luo-ci-shu-qing-kuang')}
                      >
                        <PatrolChart />
                      </ElCard>
                    </ElCol>
                    <ElCol span={6} xs={12}>
                      <ElCard
                        class=" whitespace-nowrap overflow-hidden text-ellipsis"
                        header={t('yi-chang-qing-kuang-lei-xing-dui-bi')}
                      >
                        <BarChart />
                      </ElCard>
                    </ElCol>
                  </ElRow>
                  <ElRow gutter={20}>
                    <ElCol span={18} xs={12}>
                      <ElCard
                        class=" whitespace-nowrap overflow-hidden text-ellipsis"
                        header={t('yi-chang-qing-kuang-dui-bi')}
                      >
                        <AbnormalChart />
                      </ElCard>
                    </ElCol>
                    <ElCol span={6} xs={12}>
                      <ElCard
                        class=" whitespace-nowrap overflow-hidden text-ellipsis"
                        header={t('yi-chang-qing-kuang-lei-xing-zhan-bi')}
                      >
                        <PieChart />
                      </ElCard>
                    </ElCol>
                  </ElRow>
                </div>
              </ElScrollbar>
            </div>
          </div>
        </ElMain>
      </ElContainer>
    )
  }
})
