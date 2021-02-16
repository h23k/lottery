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
      :sort-by="['currentRate', '0', 'count', 'number']"
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
      const currentIntervalCounts = []
      const intervalKeys = LuckyIntervals.getIntervalKeys()
      intervalKeys.forEach((intervalKey) => {
        currentIntervalCounts.push(0)
      })
      this.numIntervals.forEach((numInterval) => {
        const lastTimes = numInterval.times[0] || 0
        const intervalIndex = LuckyIntervals.getIntervalKeysIndex(
          this.latestTimes - lastTimes + 1
        )
        currentIntervalCounts[intervalIndex]++
      })
      return currentIntervalCounts
    },
    dataTableHeaders() {
      const headers = [
        { text: '数字', value: 'number', align: 'center' },
        { text: '次回率(%)', value: 'currentRate', align: 'right' },
        { text: '回数(回)', value: 'count', align: 'right' },
        { text: '次回差(回前)', value: 'currentInterval', align: 'right' },
      ]
      for (let i = 0; i < 10; i++) {
        headers.push({
          text: `${i + 1}回前差(回前)`,
          value: `${i}`,
          align: 'right',
        })
      }
      return headers
    },
    intervalItems() {
      return this.numIntervals.map((numInterval) => {
        const item = {
          number: numInterval.number,
          count: numInterval.times.length,
        }

        let prevTimes = this.latestTimes + 1
        numInterval.times.forEach((times, index) => {
          const luckyInterval = prevTimes - times
          if (index === 0) {
            const intervalKeysIndex = LuckyIntervals.getIntervalKeysIndex(
              luckyInterval
            )
            item.currentInterval = luckyInterval
            item.intervalCount = this.currentIntervalCounts[intervalKeysIndex]
            item.numberLength = Object.keys(this.numIntervals).length
            item.currentRate = this.$convertDisplayRate(
              item.numberLength,
              item.intervalCount
            )
          } else {
            item[index - 1] = prevTimes - times
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
      this.intervalItems.map((intervalItem) => {
        return {
          number: intervalItem.number,
          intervalRate: intervalItem.currentRate,
          intervalLength: intervalItem.numberLength,
          intervalCount: intervalItem.intervalCount,
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
  },
}
</script>
