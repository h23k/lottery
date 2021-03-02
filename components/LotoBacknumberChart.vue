<template>
  <v-col>
    <ChartBar :chart-data="chartBackgroundData" :options="barOptions" />
    <!-- <v-divider class="my-10"></v-divider>
    <ChartLine :chart-data="chartBackgroundData" :options="lineOptions" /> -->
    <v-divider class="my-10"></v-divider>
    <ChartBar :chart-data="chartBackgroundData2" :options="barOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
// import ChartLine from '@/components/ChartLine'
import ChartBar from '@/components/ChartBar'
import LuckyIntervals from '@/plugins/lucky-intervals'

export default {
  components: {
    // ChartLine,
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
      return keys.sort().reverse().slice(0, 53)
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
      this.backnumber.forEach((backnumber) => {
        labels.push(`${backnumber.times}回`)

        const intervalSummary = {}
        this.sortByInterval4Backnumber(backnumber.nums).forEach((num) => {
          if (num.bonus !== 0) return
          const interval = backnumber.times - num.last
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
    chartBackgroundData2() {
      const datasets = []
      const intervalKeys = [
        { tens: 0, label: '01-09' },
        { tens: 1, label: '10-19' },
        { tens: 2, label: '20-29' },
        { tens: 3, label: '30-39' },
        { tens: 4, label: '40-49' },
      ]
      const colors = LuckyIntervals.getIntervalColors()
      intervalKeys.forEach((key, i) => {
        datasets.push({
          label: `${key.label}`,
          backgroundColor: colors[i * 2].background,
          borderColor: colors[i * 2].border,
          borderWidth: 1,
          data: [],
        })
      })
      const labels = []
      this.backnumber.forEach((backnumber) => {
        labels.push(`${backnumber.times}回`)

        const intervalSummary = {}
        this.sortByNumber4Backnumber(backnumber.nums).forEach((num) => {
          if (num.bonus !== 0) return
          const intervalKey = Math.floor(num.number / 10)
          const currentCount = intervalSummary[intervalKey] || 0
          intervalSummary[intervalKey] = currentCount + 1
        })
        datasets.forEach((dataset, i) => {
          const key = intervalKeys[i].tens
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
    sortByNumber4Backnumber(nums) {
      const arr = nums.concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return a.number - b.number
      })
      return arr
    },
    sortByInterval4Backnumber(nums) {
      const arr = nums.concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return a.last - b.last
      })
      return arr
    },
  },
}
</script>
