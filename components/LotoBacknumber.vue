<template>
  <v-col>
    <v-data-table
      dense
      caption="過去の結果"
      :headers="backnumberHeader"
      :items="backnumberItems"
      sort-by="times"
      :sort-desc="true"
      item-key="times"
    >
      <template v-slot:[`item.times`]="{ item }">
        {{ item.times }}
        <br />
        {{ item.date }}
      </template>

      <template v-slot:[`item.number1`]="{ item }">
        <NumberChip :number="Number(item.number1)" />
        <br />
        {{ item.interval1 }}回前
      </template>
      <template v-slot:[`item.number2`]="{ item }">
        <NumberChip :number="Number(item.number2)" />
        <br />
        {{ item.interval2 }}回前
      </template>
      <template v-slot:[`item.number3`]="{ item }">
        <NumberChip :number="Number(item.number3)" />
        <br />
        {{ item.interval3 }}回前
      </template>
      <template v-slot:[`item.number4`]="{ item }">
        <NumberChip :number="Number(item.number4)" />
        <br />
        {{ item.interval4 }}回前
      </template>
      <template v-slot:[`item.number5`]="{ item }">
        <NumberChip :number="Number(item.number5)" />
        <br />
        {{ item.interval5 }}回前
      </template>
      <template v-slot:[`item.number6`]="{ item }">
        <NumberChip :number="Number(item.number6)" />
        <br />
        {{ item.interval6 }}回前
      </template>
      <template v-slot:[`item.number7`]="{ item }">
        <NumberChip :number="Number(item.number7)" />
        <br />
        {{ item.interval7 }}回前
      </template>

      <template v-slot:[`item.bonus1`]="{ item }">
        <NumberChip :number="Number(item.bonus1)" />
      </template>
      <template v-slot:[`item.bonus2`]="{ item }">
        <NumberChip :number="Number(item.bonus2)" />
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <ChartBar :chart-data="chartBarData" :options="chartBarOptions" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import NumberChip from '@/components/NumberChip'

export default {
  components: {
    NumberChip,
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
    colors: [
      ['rgb(254, 237, 56, 0.2)', 'rgb(254, 237, 56)'],
      ['rgb(163, 203, 71, 0.2)', 'rgb(163, 203, 71)'],
      ['rgb(120, 188, 123, 0.2)', 'rgb(120, 188, 123)'],
      ['rgb(40, 167, 163, 0.2)', 'rgb(40, 167, 163)'],
      ['rgb(23, 143, 183, 0.2)', 'rgb(23, 143, 183)'],
      ['rgb(41, 125, 192, 0.2)', 'rgb(41, 125, 192)'],
      ['rgb(102, 106, 169, 0.2)', 'rgb(102, 106, 169)'],
      ['rgb(223, 97, 138, 0.2)', 'rgb(223, 97, 138)'],
      ['rgb(239, 103, 95, 0.2)', 'rgb(239, 103, 95)'],
      ['rgb(243, 125, 80, 0.2)', 'rgb(243, 125, 80)'],
      ['rgb(249, 167, 67, 0.2)', 'rgb(249, 167, 67)'],
    ],
  }),
  computed: {
    getNumberCount() {
      return this.type === 6 ? 6 : 7
    },
    getBonusCount() {
      return this.type === 6 ? 1 : 2
    },
    ...mapState('loto', ['loto6Backnumber', 'loto7Backnumber']),
    backnumber() {
      return this.type === 6 ? this.loto6Backnumber : this.loto7Backnumber
    },
    backnumberTimes() {
      const keys = Object.keys(this.backnumber)
      return keys.sort().reverse()
    },
    backnumberHeader() {
      const headers = []
      headers.push({ text: '開催回', value: 'times', align: 'center' })
      for (let i = 1; i <= this.getNumberCount; i++) {
        headers.push({ text: '本数字', value: `number${i}`, align: 'center' })
      }
      for (let i = 1; i <= this.getBonusCount; i++) {
        headers.push({
          text: 'ボーナス',
          value: `bonus${i}`,
          align: 'center',
        })
      }
      return headers
    },
    backnumberItems() {
      return this.backnumberTimes.map((times) => {
        const item = {}
        item.times = `${times}回`
        item.date = this.backnumber[times].date
        this.sortByNumber4Backnumber2(times).forEach((element, index) => {
          let key = ''
          let interval = ''
          if (index < this.getNumberCount) {
            key = `number${index + 1}`
            interval = `interval${index + 1}`
          } else {
            key = `bonus${index - this.getNumberCount + 1}`
          }
          item[key] = element.number
          item[interval] = times - element.last
        })
        return item
      })
    },
    chartBarData() {
      const labels = []
      const datasets = []
      for (let i = 0; i <= 10; i++) {
        datasets.push({
          label: `${i + 1}回前`,
          backgroundColor: this.colors[`${(i + 1) % 11}`][0],
          borderColor: this.colors[`${(i + 1) % 11}`][1],
          borderWidth: 1,
          data: [],
        })
      }
      this.backnumberTimes.forEach((times) => {
        labels.push(`${times}回`)

        const intervalSummary = {}
        this.sortByNumber4Backnumber2(times).forEach((element) => {
          if (element.bonus !== 0) return
          const interval =
            times - element.last <= 10 ? times - element.last : 11
          const currentCount = intervalSummary[interval] || 0
          intervalSummary[interval] = currentCount + 1
        })
        // const intervalKeys = Object.keys(intervalSummary).sort((acc, cur) => {
        //   return acc - cur
        // })
        datasets.forEach((dataset, i) => {
          const key = i + 1
          if (intervalSummary[key]) {
            dataset.data.push(intervalSummary[key])
          } else {
            dataset.data.push(0)
          }
        })
      })
      return {
        labels,
        datasets,
      }
    },
    chartBarOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
            },
          ],
          yAxes: [
            {
              stacked: true,
            },
          ],
        },
      }
    },
  },
  methods: {
    sortByNumber4Backnumber(times) {
      const arr = this.backnumber[times].nums.concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return a.number - b.number
      })
      return arr
    },
    sortByNumber4Backnumber2(times) {
      const arr = this.backnumber[times].nums.concat()
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
