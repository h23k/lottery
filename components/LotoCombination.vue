<template>
  <v-col cols="12" sm="6" md="4" lg="2">
    <v-data-table
      v-model="selected"
      dense
      show-select
      :hide-default-footer="true"
      :caption="number"
      :headers="numCombinationHeader"
      :items="numCombinationItems"
      :items-per-page="numCombinationItems.length"
      sort-by="count"
      :sort-desc="true"
      item-key="number"
    >
      <template v-slot:item.number="{ item }">
        <NumberChip :number="item.number" />
      </template>
    </v-data-table>
  </v-col>
</template>

<script>
import { mapState, mapActions } from 'vuex'
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
  computed: {
    ...mapState('loto', ['loto6NumCombination', 'loto7NumCombination']),
    numCombination() {
      return this.type === 6
        ? this.loto6NumCombination
        : this.loto7NumCombination
    },
    numCombinationHeader() {
      return [
        { text: '数字', value: 'number', align: 'center' },
        { text: '回数', value: 'count', align: 'right' },
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
        items.push({
          number: key,
          count: combination[key],
        })
      })
      return items
    },
  },
  mounted() {
    if (this.type === 6) {
      this.setLoto6NumCombination({ max: 43 })
    } else {
      this.setLoto7NumCombination({ max: 37 })
    }
  },
  methods: {
    ...mapActions('loto', ['setLoto6NumCombination', 'setLoto7NumCombination']),
  },
}
</script>
