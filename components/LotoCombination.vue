<template>
  <v-col sm="6" md="4">
    <v-data-table
      v-model="selectRow"
      dense
      show-select
      :hide-default-footer="true"
      :headers="numCombinationHeader"
      :items="numCombinationItems"
      :items-per-page="numCombinationItems.length"
      :sort-by="['comboCount', 'interval']"
      :sort-desc="[true, false]"
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

export default {
  components: {
    NumberChip,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
    number: {
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
      'loto6Numbers',
      'loto6NumCombination',
      'loto7Numbers',
      'loto7NumCombination',
    ]),
    numbers() {
      return this.type === 6 ? this.loto6Numbers : this.loto7Numbers
    },
    numCombination() {
      return this.type === 6
        ? this.loto6NumCombination
        : this.loto7NumCombination
    },
    numCombinationHeader() {
      return [
        { text: '数字', value: 'number', align: 'center' },
        { text: '組合せ回数', value: 'comboCount', align: 'right' },
        { text: '最近出現数', value: 'recentCount', align: 'right' },
        { text: '次回差(回前)', value: 'interval', align: 'right' },
      ]
    },
    numCombinationItems() {
      const target = this.numCombination.find(
        (element) => Number(element.number) === this.number
      ) || { combination: { [this.number]: 0 } }
      const combination = target.combination
      const sortCombination = Object.keys(combination)
        .sort((acc, cur) => {
          if (combination[acc] === combination[cur]) {
            return cur - acc
          }
          return combination[acc] - combination[cur]
        })
        .reverse()
      const items = []
      sortCombination.forEach((key) => {
        const number = this.numbers.find(
          (number) => String(number.number) === key
        )
        items.push({
          number: key,
          comboCount: combination[key],
          recentCount: number.luckyRecentCount,
          interval: number.timesDiff,
        })
      })
      return items
    },
  },
  mounted() {
    this.selectRow = this.selected
  },
  beforeUpdate() {
    this.selectRow = this.selected
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
