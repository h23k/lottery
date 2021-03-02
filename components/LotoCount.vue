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
      :sort-by="['luckyRecentCount', 'luckyCount', 'timesDiff']"
      :sort-desc="[true, true, false]"
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
// import LuckyIntervals from '@/plugins/lucky-intervals'

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
    numbersInterval: {
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
      { text: '出現数', value: 'luckyCount', align: 'right' },
      { text: '出現数順位', value: 'luckyRank', align: 'right' },
      { text: '最近出現数', value: 'luckyRecentCount', align: 'right' },
      { text: '最近出現数順位', value: 'luckyRecentRank', align: 'right' },
      { text: '出現率(%)', value: 'luckyRate', align: 'right' },
      { text: '最近出現率(%)', value: 'luckyRecentRate', align: 'right' },
      { text: '次回差(回前)', value: 'timesDiff', align: 'right' },
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
        item.luckyRank = this.getLuckyRank('luckyCount', item.luckyCount)
        item.luckyRecentRank = this.getLuckyRank(
          'luckyRecentCount',
          item.luckyRecentCount
        )
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
      this.countItems.map((item) => {
        return {
          number: item.number,
          luckyRank: item.luckyRank,
          luckyRecentRank: item.luckyRecentRank,
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
    getLuckyRank(name, value) {
      let rank = 1
      this.numbers.forEach((number) => {
        if (number[name] > value) rank++
      })
      return rank
    },
  },
}
</script>
