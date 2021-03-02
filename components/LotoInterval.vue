<template>
  <v-col>
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現間隔（最近）"
      :headers="dataTableHeaders"
      :items="intervalItems"
      :items-per-page="intervalItems.length"
      :sort-by="['intervalRate', '1', 'luckyCount', 'number']"
      :sort-desc="[true, false, true, false]"
      item-key="number"
    >
      <template v-slot:[`item.number`]="{ item }">
        <NumberChip
          :number="Number(item.number)"
          :outlined="!isSelected(item.number)"
        />
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
    ...mapState('loto', [
      'loto6LatestTimes',
      'loto6NumInterval',
      'loto7LatestTimes',
      'loto7NumInterval',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    numIntervals() {
      return this.type === 6 ? this.loto6NumInterval : this.loto7NumInterval
    },
    currentIntervalCounts() {
      const currentIntervalCounts = {}
      LuckyIntervals.getIntervalKeys().forEach((intervalKey) => {
        currentIntervalCounts[intervalKey] = 0
      })
      this.numIntervals.forEach((numInterval) => {
        const lastTimes = numInterval.times[0] || 0
        const intervalKey = LuckyIntervals.getIntervalKey(
          this.latestTimes - lastTimes + 1
        )
        currentIntervalCounts[intervalKey]++
      })
      return currentIntervalCounts
    },
    dataTableHeaders() {
      const headers = [
        { text: '数字', value: 'number', align: 'center' },
        { text: '最近出現数(回)', value: 'luckyCount', align: 'right' },
        { text: '次回率(%)', value: 'intervalRate', align: 'right' },
        { text: '次回率順位', value: 'intervalRank', align: 'right' },
        { text: '次回差(回前)', value: 'interval', align: 'right' },
      ]
      for (let i = 0; i < 5; i++) {
        headers.push({
          text: `${i + 1}回前(回前)`,
          value: `${i + 1}`,
          align: 'right',
        })
      }
      return headers
    },
    intervalItems() {
      return this.numIntervals.map((numInterval) => {
        const item = {
          number: numInterval.number,
          luckyCount: numInterval.times.length,
        }

        let prevTimes = this.latestTimes + 1
        numInterval.times.forEach((times, index) => {
          const interval = prevTimes - times
          if (index === 0) {
            const intervalKey = LuckyIntervals.getIntervalKey(interval)
            const intervalCount = this.currentIntervalCounts[intervalKey]
            const numbersCount = Object.keys(this.numIntervals).length
            item.interval = interval
            item.intervalRate = this.$convertDisplayRate(
              numbersCount,
              intervalCount
            )
            item.intervalRank = this.getLuckyRank(intervalCount)
          } else {
            item[index] = interval
          }
          prevTimes = times
        })
        return item
      })
    },
  },
  beforeUpdate() {
    this.selectRow = this.selected
  },
  updated() {
    this.$emit(
      'onLoad',
      this.intervalItems.map((item) => {
        return {
          number: item.number,
          intervalRank: item.intervalRank,
        }
      })
    )
  },
  methods: {
    isSelected(number) {
      const selectedIndex = this.selected.findIndex((element) => {
        return element.number === Number(number)
      })
      return selectedIndex !== -1
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
