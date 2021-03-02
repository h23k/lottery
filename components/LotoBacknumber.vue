<template>
  <v-col>
    <v-data-table
      dense
      :hide-default-footer="true"
      caption="出現間隔集計"
      :headers="backnumberIntervalHeader"
      :items="intervalSummaryItems"
      :items-per-page="intervalSummaryItems.length"
      :sort-by="['timesRate', 'intervalRate']"
      :sort-desc="[true, true]"
      item-key="intervalKey"
    >
      <template v-slot:[`item.intervalKey`]="{ item }">
        {{ item.intervalKey }}回前
      </template>
    </v-data-table>
    <v-divider class="my-10"></v-divider>
    <v-data-table
      dense
      :hide-default-footer="true"
      caption="10の位集計"
      :headers="backnumberDigitHeader"
      :items="digitSummaryItems"
      :items-per-page="digitSummaryItems.length"
      :sort-by="['digitKey']"
      :sort-desc="[false]"
      item-key="digitKey"
    >
      <template v-slot:[`item.digitKey`]="{ item }">
        {{ item.digitKey }}0番台
      </template>
    </v-data-table>
    <v-divider class="my-10"></v-divider>
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現間隔別回数"
      :headers="backnumberNumberHeader"
      :items="numbersIntervalItems"
      :items-per-page="numbersIntervalItems.length"
      :sort-by="['digitLuckyRate', 'intervalLuckyRate', 'luckyCount', 'number']"
      :sort-desc="[true, true, true, false]"
      item-key="number"
    >
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

      <template v-slot:[`item.lucky1`]="{ item }">
        <NumberChip
          :number="Number(item.lucky1)"
          :outlined="!isSelected(item.lucky1)"
        />
        <div class="text-body-2">{{ item.interval1 }}回前</div>
      </template>
      <template v-slot:[`item.lucky2`]="{ item }">
        <NumberChip
          :number="Number(item.lucky2)"
          :outlined="!isSelected(item.lucky2)"
        />
        <div class="text-body-2">{{ item.interval2 }}回前</div>
      </template>
      <template v-slot:[`item.lucky3`]="{ item }">
        <NumberChip
          :number="Number(item.lucky3)"
          :outlined="!isSelected(item.lucky3)"
        />
        <div class="text-body-2">{{ item.interval3 }}回前</div>
      </template>
      <template v-slot:[`item.lucky4`]="{ item }">
        <NumberChip
          :number="Number(item.lucky4)"
          :outlined="!isSelected(item.lucky4)"
        />
        <div class="text-body-2">{{ item.interval4 }}回前</div>
      </template>
      <template v-slot:[`item.lucky5`]="{ item }">
        <NumberChip
          :number="Number(item.lucky5)"
          :outlined="!isSelected(item.lucky5)"
        />
        <div class="text-body-2">{{ item.interval5 }}回前</div>
      </template>
      <template v-slot:[`item.lucky6`]="{ item }">
        <NumberChip
          :number="Number(item.lucky6)"
          :outlined="!isSelected(item.lucky6)"
        />
        <div class="text-body-2">{{ item.interval6 }}回前</div>
      </template>
      <template v-slot:[`item.lucky7`]="{ item }">
        <NumberChip
          :number="Number(item.lucky7)"
          :outlined="!isSelected(item.lucky7)"
        />
        <div class="text-body-2">{{ item.interval7 }}回前</div>
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
      'loto6BacknumberNumbers',
      'loto7LatestTimes',
      'loto7Backnumber',
      'loto7BacknumberNumbers',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    backnumber() {
      return this.type === 6 ? this.loto6Backnumber : this.loto7Backnumber
    },
    backnumberNumbers() {
      return this.type === 6
        ? this.loto6BacknumberNumbers
        : this.loto7BacknumberNumbers
    },
    backnumberIntervalTotals() {
      const intervalTotoals = {}
      this.backnumberNumbers.forEach((backnumber) => {
        backnumber.numbers.forEach((number) => {
          const intervalKey = LuckyIntervals.getIntervalKey(number.timesDiff)
          intervalTotoals[intervalKey] = (intervalTotoals[intervalKey] || 0) + 1
        })
      })
      return intervalTotoals
    },
    backnumberSummarys() {
      const intervalsSummary = {}
      const digitsSummary = {}
      this.backnumber.forEach((backnumber) => {
        let tmpInterval = 0
        this.sortByInterval4Backnumber(backnumber.nums).forEach((num) => {
          if (num.bonus !== 0) return
          const interval = backnumber.times - num.last
          const intervalKey = LuckyIntervals.getIntervalKey(interval)
          const intervalSummary = intervalsSummary[intervalKey] || {
            totalCount: 0,
            timesCount: 0,
          }
          intervalSummary.totalCount++
          if (tmpInterval !== intervalKey) {
            intervalSummary.timesCount++
          }
          tmpInterval = intervalKey
          intervalsSummary[intervalKey] = intervalSummary

          const digitKey = Math.floor(num.number / 10)
          const digitSummary = digitsSummary[digitKey] || {
            totalCount: 0,
          }
          digitSummary.totalCount++
          digitSummary[intervalKey] = (digitSummary[intervalKey] || 0) + 1
          digitsSummary[digitKey] = digitSummary
        })
      })
      return { intervalsSummary, digitsSummary }
    },
    backnumberHeader() {
      const headers = []
      headers.push({ text: '開催回', value: 'times', align: 'center' })
      headers.push({ text: '合計', value: 'numberTotal', align: 'right' })
      for (let i = 1; i <= this.getNumberCount; i++) {
        headers.push({ text: '本数字', value: `lucky${i}`, align: 'center' })
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
      return this.backnumber.map((backnumber) => {
        backnumber.numberTotal = 0
        this.sortByNumber4Backnumber(backnumber.nums).forEach((num, index) => {
          if (num.bonus === 0) {
            backnumber.numberTotal += num.number
            backnumber[`lucky${index + 1}`] = num.number
            backnumber[`interval${index + 1}`] = backnumber.times - num.last
          } else {
            backnumber[`bonus${index + 1 - this.getNumberCount}`] = num.number
          }
        })
        return backnumber
      })
    },
    backnumberIntervalHeader() {
      const headers = []
      headers.push({ text: '出現間隔', value: 'intervalKey', align: 'center' })
      headers.push({ text: '間隔数', value: 'intervalTotal', align: 'right' })
      headers.push({ text: '出現数', value: 'totalCount', align: 'right' })
      headers.push({ text: '出現数率', value: 'intervalRate', align: 'right' })
      headers.push({ text: '出現回', value: 'timesCount', align: 'right' })
      headers.push({ text: '出現回率', value: 'timesRate', align: 'right' })
      headers.push({ text: '回平均', value: 'avgCount', align: 'right' })
      return headers
    },
    intervalSummaryItems() {
      const items = []
      const intervalsSummary = this.backnumberSummarys.intervalsSummary
      Object.keys(intervalsSummary).forEach((intervalKey) => {
        const intervalTotal = this.backnumberIntervalTotals[intervalKey]
        const summary = intervalsSummary[intervalKey]
        items.push({
          intervalKey,
          intervalTotal,
          scale: Number(
            (this.getMaximumIntervalTotals() / intervalTotal).toFixed(2)
          ),
          totalCount: summary.totalCount,
          timesCount: summary.timesCount,
          intervalRate: this.$convertDisplayRate(
            intervalTotal,
            summary.totalCount
          ),
          timesRate: this.$convertDisplayRate(
            this.backnumber.length,
            summary.timesCount
          ),
          avgCount:
            Math.floor((summary.totalCount / summary.timesCount) * 100) / 100,
        })
      })
      return items
    },
    backnumberDigitHeader() {
      const headers = []
      headers.push({ text: '10の位', value: 'digitKey', align: 'center' })
      headers.push({ text: '出現数', value: 'totalCount', align: 'right' })
      LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
        headers.push({
          text: `${intervalKey}回前`,
          value: intervalKey,
          align: 'right',
        })
      })
      return headers
    },
    digitSummaryItems() {
      const items = []
      const digitsSummary = this.backnumberSummarys.digitsSummary
      Object.keys(digitsSummary).forEach((digitKey) => {
        const summary = digitsSummary[digitKey]
        const item = {
          digitKey,
          totalCount: summary.totalCount,
        }
        LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
          item[intervalKey] = summary[intervalKey]
        })
        items.push(item)
      })
      return items
    },
    backnumberNumberHeader() {
      const headers = []
      headers.push({ text: '数字', value: 'number', align: 'center' })
      headers.push({
        text: '次回差(回前)',
        value: 'interval',
        align: 'right',
      })
      headers.push({
        text: '間隔率(%)',
        value: 'intervalLuckyRate',
        align: 'right',
      })
      headers.push({
        text: '十位率(%)',
        value: 'digitLuckyRate',
        align: 'right',
      })
      headers.push({
        text: '出現間隔率(%)',
        value: 'intervalRate',
        align: 'right',
      })
      headers.push({
        text: '最近出現数',
        value: 'luckyCount',
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
    numbersIntervalItems() {
      const items = []
      this.backnumber.forEach((backnumber) => {
        this.sortByInterval4Backnumber(backnumber.nums).forEach((num) => {
          if (num.bonus !== 0) return
          const number = num.number

          let itemIndex = items.findIndex(
            (item) => Number(item.number) === Number(number)
          )
          if (itemIndex === -1) {
            const current = this.latestTimes - backnumber.times + 1
            const luckyRates = this.getLuckyRates(number, current)
            const item = {
              number,
              interval: current,
              intervalTotal: 0,
              // intervalScale: luckyRates.intervalScale,
              intervalLuckyRate: luckyRates.intervalRate,
              digitLuckyRate: luckyRates.digitRate,
              luckyCount: 0,
            }
            LuckyIntervals.getIntervalKeys().forEach((key) => {
              item[key] = 0
            })
            items.push(item)
            itemIndex = items.length - 1
          }

          const item = items[itemIndex]
          const currentIntervalKey = LuckyIntervals.getIntervalKey(
            item.interval
          )
          const interval = backnumber.times - num.last
          const intervalKey = LuckyIntervals.getIntervalKey(interval)
          item.luckyCount++
          item.intervalTotal += interval
          item[intervalKey]++
          item.intervalRate = this.$convertDisplayRate(
            item.luckyCount,
            item[currentIntervalKey]
          )
          item.intervalAvg =
            Math.floor((item.intervalTotal / item.luckyCount) * 10) / 10
          items[itemIndex] = item
        })
      })
      return items
    },
  },
  beforeUpdate() {
    this.selectRow = this.selected
  },
  updated() {
    this.$emit('onLoad', {
      backnumbers: this.backnumberItems,
      intervalSummary: this.intervalSummaryItems,
      numbersInterval: this.numbersIntervalItems,
    })
  },
  methods: {
    isSelected(number) {
      const selectedIndex = this.selected.findIndex(
        (element) => element.number === number
      )
      return selectedIndex !== -1
    },
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
    getMaximumIntervalTotals() {
      let maximum = 0
      for (const key in this.backnumberIntervalTotals) {
        const total = this.backnumberIntervalTotals[key]
        if (maximum < total) maximum = total
      }
      return maximum
    },
    getLuckyRates(number, interval) {
      const digitKey = String(Math.floor(number / 10))
      const intervalKey = LuckyIntervals.getIntervalKey(interval)

      const intervalSummary = this.intervalSummaryItems.find(
        (item) => item.intervalKey === intervalKey
      )
      const digitSummary = this.digitSummaryItems.find(
        (item) => item.digitKey === digitKey
      )
      return {
        intervalRate: intervalSummary.intervalRate,
        intervalScale: intervalSummary.scale,
        digitRate: this.$convertDisplayRate(
          digitSummary.totalCount,
          digitSummary[intervalKey]
        ),
      }
    },
    getLuckyRank(count) {
      let rank = 1
      for (const key in this.currentIntervalCounts) {
        if (this.currentIntervalCounts[key] > count) rank++
      }
      return rank
    },
  },
}
</script>
