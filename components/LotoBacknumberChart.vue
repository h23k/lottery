<template>
  <v-col>
    <ChartBar :chart-data="chartBackgroundData" :options="barOptions" />
    <v-divider class="my-10"></v-divider>
    <ChartLine :chart-data="chartBackgroundData" :options="lineOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import ChartLine from '@/components/ChartLine'
import ChartBar from '@/components/ChartBar'
import LuckyIntervals from '@/plugins/lucky-intervals'

export default {
  components: {
    ChartLine,
    ChartBar,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    lineOptions: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: 'index',
      },
    },
    barOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }],
      },
      tooltips: {
        mode: 'index',
      },
    },
  }),
  computed: {
    ...mapState('loto', ['loto6Backnumber', 'loto7Backnumber']),
    backnumber() {
      return this.type === 6 ? this.loto6Backnumber : this.loto7Backnumber
    },
    backnumberTimes() {
      const keys = Object.keys(this.backnumber)
      return keys.sort().reverse()
    },
    chartBackgroundData() {
      const datasets = []
      const intervalKeys = LuckyIntervals.getIntervalKeys()
      const colors = LuckyIntervals.getIntervalColors()
      intervalKeys.forEach((key, i) => {
        datasets.push({
          label: `${key}回前`,
          backgroundColor: colors[i].background,
          borderColor: colors[i].border,
          borderWidth: 1,
          lineTension: 0,
          // fill: false,
          data: [],
        })
      })
      const labels = []
      this.backnumberTimes.forEach((times) => {
        labels.push(`${times}回`)

        const intervalSummary = {}
        this.sortByInterval4Backnumber(times).forEach((element) => {
          if (element.bonus !== 0) return
          const interval = times - element.last
          const intervalKey = LuckyIntervals.getIntervalKey(interval)
          const currentCount = intervalSummary[intervalKey] || 0
          intervalSummary[intervalKey] = currentCount + 1
        })
        datasets.forEach((dataset, i) => {
          const key = intervalKeys[i]
          dataset.data.push(intervalSummary[key] || 0)
        })
      })
      return {
        labels,
        datasets,
      }
    },
  },
  methods: {
    sortByNumber4Backnumber(times) {
      const luckyNumbers = this.backnumber[times] || { nums: [] }
      const arr = luckyNumbers.nums.concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return a.number - b.number
      })
      return arr
    },
    sortByInterval4Backnumber(times) {
      const luckyNumbers = this.backnumber[times] || { nums: [] }
      const arr = luckyNumbers.nums.concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        const aInterval = times - a.last
        const bInterval = times - b.last
        return aInterval - bInterval
      })
      return arr
    },
  },
}
</script>
