<template>
  <v-col>
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現回数"
      :headers="dataTableHeaders"
      :items="countItems"
      :items-per-page="countItems.length"
      :sort-by="['timesDiffRate', 'luckyRecentRate', 'luckyRate', 'number']"
      :sort-desc="[true, true, true, false]"
      item-key="number"
    >
      <template
        v-slot:[`item.data-table-select`]="{ item, isSelected, select }"
      >
        <v-simple-checkbox
          :value="isSelected"
          @input="clickCheckBox(item, isSelected, select)"
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.number`]="{ item }">
        <NumberChip :number="Number(item.number)" :outlined="false" />
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
    backnumberCount: {
      type: Number,
      default: 0,
    },
    intervalSummary: {
      type: Array,
      default: () => {
        return []
      },
    },
    intervals: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data: () => ({
    selectRow: [],
    dataTableHeaders: [
      { text: '数字', value: 'number', align: 'center' },
      { text: '全体回数(回)', value: 'luckyCount', align: 'right' },
      { text: '最近回数(回)', value: 'luckyRecentCount', align: 'right' },
      { text: '全体出現率(%)', value: 'luckyRate', align: 'right' },
      { text: '最近出現率(%)', value: 'luckyRecentRate', align: 'right' },
      { text: '出現間隔(回前)', value: 'timesDiff', align: 'right' },
      { text: '間隔出現率(%)', value: 'intervalRate', align: 'right' },
      { text: '出現間隔率(%)', value: 'timesDiffRate', align: 'right' },
      { text: '出現差数(回)', value: 'intervalCount', align: 'right' },
    ],
  }),
  computed: {
    getNumberCount() {
      return this.type === 6 ? 6 : 7
    },
    ...mapState('loto', [
      'loto6LatestTimes',
      'loto6Numbers',
      'loto7LatestTimes',
      'loto7Numbers',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    numbers() {
      return this.type === 6 ? this.loto6Numbers : this.loto7Numbers
    },
    countItems() {
      return this.numbers.map((number) => {
        const item = number
        item.totalRate = this.$convertDisplayRate(
          this.latestTimes,
          number.totalCount
        )
        item.luckyRate = this.$convertDisplayRate(
          this.latestTimes,
          number.luckyCount
        )
        item.luckyRecentRate = this.$convertDisplayRate(
          number.recentCountMax,
          number.luckyRecentCount
        )
        item.recentRate = this.$convertDisplayRate(
          number.luckyCount,
          number.luckyRecentCount
        )
        const intervalKeysIndex = LuckyIntervals.getIntervalKeysIndex(
          number.timesDiff
        )
        const intervalSummary = this.intervalSummary[intervalKeysIndex] || {
          timesCount: 0,
        }
        item.intervalRate = this.$convertDisplayRate(
          this.backnumberCount,
          intervalSummary.timesCount
        )
        item.timesDiffRate = this.$convertDisplayRate(
          this.numbers.length,
          this.intervalCounts[intervalKeysIndex]
        )
        const interval = this.intervals.find((element) => {
          if (Number(element.number) === Number(number.number)) {
            return element
          }
        })
        const intervalKey = LuckyIntervals.getIntervalKey(number.timesDiff)
        if (interval) {
          item.intervalCount = interval[intervalKey]
        }
        return item
      })
    },
    intervalCounts() {
      const intervalCounts = []
      const intervalKeys = LuckyIntervals.getIntervalKeys()
      intervalKeys.forEach((intervalKey) => {
        intervalCounts.push(0)
      })
      this.numbers.forEach((number) => {
        const intervalKeysIndex = LuckyIntervals.getIntervalKeysIndex(
          number.timesDiff
        )
        intervalCounts[intervalKeysIndex]++
      })
      return intervalCounts
    },
  },
  beforeUpdate() {
    this.selectRow = this.selected
  },
  updated() {
    this.$emit(
      'onLoad',
      this.countItems.map((item) => {
        return {
          number: item.number,
          timesDiff: item.timesDiff,
          recentRate: item.recentRate,
          luckyCount: item.luckyCount,
          luckyRecentCount: item.luckyRecentCount,
        }
      })
    )
  },
  methods: {
    clickCheckBox(item, isSelected, select) {
      select(!isSelected)
      this.$emit('setSelected', {
        number: item.number,
        interval: item.timesDiff,
        isSelected: !isSelected,
      })
    },
  },
}
</script>
