<template>
  <v-col>
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現間隔別回数"
      :headers="backnumberNumberHeader"
      :items="backnumberNumberItems"
      :items-per-page="backnumberNumberItems.length"
      :sort-by="['interval', 'number']"
      :sort-desc="[false, false]"
      item-key="number"
    >
      <!-- <template
        v-slot:[`item.data-table-select`]="{ item, isSelected, select }"
      >
        <v-simple-checkbox
          :value="isSelected"
          @input="clickCheckBox(item, isSelected, select)"
        ></v-simple-checkbox>
      </template> -->
      <template v-slot:[`item.number`]="{ item }">
        <NumberChip
          :number="Number(item.number)"
          :outlined="!isSelected(item.number)"
        />
      </template>
    </v-data-table>
    <v-divider class="my-10"></v-divider>
    <v-data-table
      dense
      :hide-default-footer="true"
      caption="出現間隔集計"
      :headers="backnumberIntervalHeader"
      :items="backnumberIntervalItems"
      :items-per-page="backnumberIntervalItems.length"
      sort-by="luckyRate"
      :sort-desc="true"
      item-key="interval"
    ></v-data-table>
    <v-divider class="my-10"></v-divider>
    <v-data-table
      dense
      caption="過去の結果"
      :footer-props="{
        itemsPerPageOptions: [10, 20, 50, -1],
      }"
      :headers="backnumberHeader"
      :items="backnumberItems"
      sort-by="times"
      :sort-desc="true"
      item-key="times"
    >
      <template v-slot:[`item.times`]="{ item }">
        {{ item.date }}<br />{{ item.times }}
      </template>

      <template v-slot:[`item.number1`]="{ item }">
        <NumberChip
          :number="Number(item.number1)"
          :outlined="!isSelected(item.number1)"
        />
        <br />
        {{ item.interval1 }}回前
      </template>
      <template v-slot:[`item.number2`]="{ item }">
        <NumberChip
          :number="Number(item.number2)"
          :outlined="!isSelected(item.number2)"
        />
        <br />
        {{ item.interval2 }}回前
      </template>
      <template v-slot:[`item.number3`]="{ item }">
        <NumberChip
          :number="Number(item.number3)"
          :outlined="!isSelected(item.number3)"
        />
        <br />
        {{ item.interval3 }}回前
      </template>
      <template v-slot:[`item.number4`]="{ item }">
        <NumberChip
          :number="Number(item.number4)"
          :outlined="!isSelected(item.number4)"
        />
        <br />
        {{ item.interval4 }}回前
      </template>
      <template v-slot:[`item.number5`]="{ item }">
        <NumberChip
          :number="Number(item.number5)"
          :outlined="!isSelected(item.number5)"
        />
        <br />
        {{ item.interval5 }}回前
      </template>
      <template v-slot:[`item.number6`]="{ item }">
        <NumberChip
          :number="Number(item.number6)"
          :outlined="!isSelected(item.number6)"
        />
        <br />
        {{ item.interval6 }}回前
      </template>
      <template v-slot:[`item.number7`]="{ item }">
        <NumberChip
          :number="Number(item.number7)"
          :outlined="!isSelected(item.number7)"
        />
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
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import NumberChip from '@/components/NumberChip'
import LuckyIntervals from '@/plugins/lucky-intervals'

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
    selectRow: [],
  }),
  computed: {
    getNumberCount() {
      return this.type === 6 ? 6 : 7
    },
    getBonusCount() {
      return this.type === 6 ? 1 : 2
    },
    ...mapState('loto', [
      'loto6LatestTimes',
      'loto6Backnumber',
      'loto7LatestTimes',
      'loto7Backnumber',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
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
      headers.push({ text: '合計', value: 'sum', align: 'right' })
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
        item.sum = 0
        this.sortByInterval4Backnumber(times).forEach((element, index) => {
          let key = ''
          let interval = ''
          if (index < this.getNumberCount) {
            item.sum += element.number
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
    backnumberIntervalHeader() {
      const headers = []
      headers.push({ text: '出現間隔', value: 'interval', align: 'center' })
      headers.push({ text: '出現数(回)', value: 'totalCount', align: 'right' })
      headers.push({ text: '出現回(回)', value: 'timesCount', align: 'right' })
      headers.push({ text: '出現率(％)', value: 'luckyRate', align: 'right' })
      headers.push({ text: '回平均(個)', value: 'avgCount', align: 'right' })
      // LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
      //   headers.push({
      //     text: `${intervalKey}回前`,
      //     value: intervalKey,
      //     align: 'right',
      //   })
      // })
      return headers
    },
    backnumberIntervalItems() {
      const intervalSummary = {}
      this.backnumberTimes.forEach((times) => {
        let tmpInterval = 0
        this.sortByInterval4Backnumber(times).forEach((element) => {
          if (element.bonus !== 0) return
          const interval = times - element.last
          const intervalKey = LuckyIntervals.getIntervalKey(interval)
          const summary = intervalSummary[intervalKey] || {
            totalCount: 0,
            timesCount: 0,
          }
          summary.totalCount++
          if (tmpInterval !== intervalKey) {
            summary.timesCount++
          }
          tmpInterval = intervalKey
          intervalSummary[intervalKey] = summary

          const prevNumbers = this.sortByInterval4Backnumber(element.last)
          const prevNumber = prevNumbers.find(
            (prevElement) =>
              prevElement.bonus === 0 && prevElement.number === element.number
          )
          if (prevNumber !== undefined) {
            const prevInterval = element.last - prevNumber.last
            const prevIntervalKey = LuckyIntervals.getIntervalKey(prevInterval)
            const prevIntervalCount =
              intervalSummary[intervalKey][prevIntervalKey] || 0
            intervalSummary[intervalKey][prevIntervalKey] =
              prevIntervalCount + 1
          }
        })
      })
      const items = []
      LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
        const summary = intervalSummary[intervalKey] || {
          totalCount: 0,
          timesCount: 0,
        }
        items.push({
          interval: `${intervalKey}回前`,
          totalCount: summary.totalCount,
          timesCount: summary.timesCount,
          luckyRate: this.$convertDisplayRate(
            this.backnumberTimes.length,
            summary.timesCount
          ),
          avgCount:
            Math.floor((summary.totalCount / summary.timesCount) * 100) / 100,
          [`1`]: summary['1'] || 0,
          [`2`]: summary['2'] || 0,
          [`3`]: summary['3'] || 0,
          [`4`]: summary['4'] || 0,
          [`5`]: summary['5'] || 0,
          [`6`]: summary['6'] || 0,
          [`7`]: summary['7'] || 0,
          [`8`]: summary['8'] || 0,
          [`9`]: summary['9'] || 0,
          [`10`]: summary['10'] || 0,
          [`11+`]: summary['11+'] || 0,
        })
      })
      return items
    },
    backnumberNumberHeader() {
      const headers = []
      headers.push({ text: '数字', value: 'number', align: 'center' })
      headers.push({
        text: '出現回数(回)',
        value: 'count',
        align: 'right',
      })
      headers.push({
        text: '出現間隔率(%)',
        value: 'intervalRate',
        align: 'right',
      })
      headers.push({
        text: '出現間隔(回前)',
        value: 'current',
        align: 'right',
      })
      headers.push({
        text: '出現間隔平均(回)',
        value: 'intervalAvg',
        align: 'right',
      })
      LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
        headers.push({
          text: `${intervalKey}回前(回)`,
          value: intervalKey,
          align: 'right',
        })
      })
      return headers
    },
    backnumberNumberItems() {
      const items = []
      this.backnumberTimes.forEach((times) => {
        this.sortByInterval4Backnumber(times).forEach((element) => {
          if (element.bonus !== 0) return
          const number = element.number
          const interval = times - element.last

          let index = items.findIndex(
            (item) => Number(item.number) === Number(number)
          )
          if (index === -1) {
            const obj = {
              number,
              current: this.latestTimes - times + 1,
              currentIntervalKey: LuckyIntervals.getIntervalKey(
                this.latestTimes - times + 1
              ),
              count: 0,
              intervalTotal: 0,
            }
            LuckyIntervals.getIntervalKeys().forEach((val) => {
              obj[val] = 0
            })

            items.push(obj)
            index = items.length - 1
          }

          const item = items[index]
          item.count++
          item.intervalTotal += interval
          const intervalKey = LuckyIntervals.getIntervalKey(interval)
          item[intervalKey]++
          item.intervalRate = this.$convertDisplayRate(
            item.count,
            item[`${item.currentIntervalKey}`]
          )
          item.intervalAvg =
            Math.floor((item.intervalTotal / item.count) * 10) / 10
          items[index] = item
        })
      })
      return items
    },
  },
  updated() {
    this.$emit('onLoad', {
      backnumberCount: this.backnumberTimes.length,
      backnumberIntervalItems: this.backnumberIntervalItems,
      backnumberNumberItems: this.backnumberNumberItems,
    })
  },
  methods: {
    isSelected(number) {
      const selectedIndex = this.selected.findIndex(
        (element) => element.number === number
      )
      return selectedIndex !== -1
    },
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
