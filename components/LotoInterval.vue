<template>
  <v-col cols="12">
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現間隔（最近）"
      :headers="intervalHeader"
      :items="intervalItems"
      :items-per-page="numInterval.length"
      :sort-by="['current', 'number']"
      :sort-desc="[false, false]"
      item-key="number"
    >
      <template v-slot:[`item.number`]="{ item }">
        <NumberChip :number="Number(item.number)" />
      </template>
      <template v-slot:[`item.current`]="{ item }">
        <span v-if="isMostCount(item)" style="color: red; font-weight: bold">
          {{ item.current }}
        </span>
        <span v-else>
          {{ item.current }}
        </span>
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <ChartBar :chart-data="chartBarData" :options="chartBarOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import NumberChip from '@/components/NumberChip'
import ChartBar from '@/components/ChartBar'

export default {
  components: {
    NumberChip,
    ChartBar,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
    selected: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data: () => ({
    selectRow: [],
    intervalKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+'],
  }),
  computed: {
    ...mapState('loto', [
      'loto6LatestTimes',
      'loto6NumInterval',
      'loto7LatestTimes',
      'loto7NumInterval',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    numInterval() {
      return this.type === 6 ? this.loto6NumInterval : this.loto7NumInterval
    },
    intervalHeader() {
      const headers = [
        { text: '数字', value: 'number', align: 'center' },
        { text: '現在(回)', value: 'current', align: 'right' },
      ]
      this.intervalKeys.forEach((val) => {
        headers.push({ text: `${val}(回)`, value: `${val}`, align: 'right' })
      })
      return headers
    },
    intervalItems() {
      return this.numInterval.map((element) => {
        const items = { number: element.number }

        let prevTimes = this.latestTimes + 1
        element.times.forEach((times, i) => {
          const interval = prevTimes - times
          if (i === 0) {
            items.current = interval
          } else {
            const key =
              this.intervalKeys.find(
                (intervalKey) => intervalKey === String(interval)
              ) || this.intervalKeys.slice(-1)[0]
            items[key] = (items[key] || 0) + 1
          }
          prevTimes = times
        })
        return items
      })
    },
    chartBarData() {
      const intervalTotal = {}
      this.numInterval.forEach((element) => {
        let prevTimes = 0
        element.times.forEach((times) => {
          if (prevTimes !== 0) {
            const interval = prevTimes - times
            const currentCount = intervalTotal[interval] || 0
            intervalTotal[interval] = currentCount + 1
          }
          prevTimes = times
        })
      })
      const intervalKeys = Object.keys(intervalTotal).sort((acc, cur) => {
        return acc - cur
      })
      const labels = []
      const datasetData = []
      intervalKeys.forEach((key) => {
        labels.push(`${key}回前`)
        datasetData.push(intervalTotal[key])
      })
      return {
        labels,
        datasets: [
          {
            label: '出現間隔数',
            backgroundColor: 'rgb(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            data: datasetData,
          },
        ],
      }
    },
    chartBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
      }
    },
  },
  beforeUpdate() {
    this.selectRow = this.selected
  },
  methods: {
    isMostCount(item) {
      const currIntervalKey =
        this.intervalKeys.find(
          (intervalKey) => intervalKey === String(item.current)
        ) || this.intervalKeys.slice(-1)[0]
      const mostIntervalKey = this.intervalKeys.reduce((acc, cur) => {
        const accValue = item[acc] || 0
        const curValue = item[cur] || 0
        return accValue >= curValue ? acc : cur
      })
      return item[currIntervalKey] === item[mostIntervalKey]
    },
  },
}
</script>
