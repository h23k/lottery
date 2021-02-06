<template>
  <v-col>
    <ChartBar :chart-data="chartCountData" :options="countOptions" />
    <v-divider class="my-10"></v-divider>
    <ChartBar :chart-data="chartIntervalData" :options="intervalOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import ChartBar from '@/components/ChartBar'
import LuckyIntervals from '@/plugins/lucky-intervals'

export default {
  components: {
    ChartBar,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    countOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [
          {
            // id: 'total',
            // position: 'left',
            stacked: true,
            // ticks: { beginAtZero: true },
          },
          // {
          //   id: 'recent',
          //   position: 'right',
          //   ticks: { beginAtZero: true },
          // },
          {
            id: 'interval',
            position: 'right',
            ticks: { beginAtZero: true },
          },
        ],
      },
      tooltips: {
        mode: 'index',
      },
    },
    intervalOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }],
      },
      // tooltips: {
      //   mode: 'index',
      // },
    },
  }),
  computed: {
    getNumberCount() {
      return this.type === 6 ? 6 : 7
    },
    ...mapState('loto', ['loto6Numbers', 'loto7Numbers']),
    numbers() {
      return this.type === 6 ? this.loto6Numbers : this.loto7Numbers
    },
    chartCountData() {
      const data = {
        labels: [],
        datasets: [
          {
            label: '過去回数',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
            data: [],
            // yAxisID: 'total',
          },
          {
            label: '最近回数',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            data: [],
            // yAxisID: 'recent',
          },
          {
            label: '出現間隔',
            type: 'line',
            backgroundColor: 'rgba(155, 81, 224, 0.2)',
            borderColor: 'rgb(155, 81, 224)',
            borderWidth: 1,
            // fill: false,
            lineTension: 0,
            data: [],
            yAxisID: 'interval',
          },
        ],
      }
      this.numbers.forEach((number) => {
        data.labels.push(number.number)
        data.datasets[0].data.push(number.luckyCount - number.luckyRecentCount)
        data.datasets[1].data.push(number.luckyRecentCount)
        data.datasets[2].data.push(number.timesDiff)
      })
      return data
    },
    chartIntervalData() {
      const colors = LuckyIntervals.getIntervalColors()
      const data = {
        labels: [],
        datasets: [],
      }
      LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
        data.labels.push(`${intervalKey}回前`)
      })
      this.numbers.forEach((number) => {
        const dataset = {
          label: `${number.number}`,
          borderWidth: 1,
          data: [],
        }
        LuckyIntervals.getIntervalKeys().forEach(() => {
          dataset.data.push(0)
        })

        const index = LuckyIntervals.getIntervalKeysIndex(number.timesDiff)
        dataset.data[index] = 1
        dataset.backgroundColor = colors[index].background
        dataset.borderColor = colors[index].border
        data.datasets.push(dataset)
      })
      return data
    },
  },
}
</script>
