<template>
  <v-col cols="12">
    <v-data-table
      dense
      :hide-default-footer="true"
      caption="過去の結果"
      :headers="backnumberHeader"
      :items="backnumberItems"
      :items-per-page="backnumberItems.length"
      sort-by="times"
      :sort-desc="true"
      item-key="times"
    >
      <template v-slot:item.number1="{ item }">
        <NumberChip :number="item.number1" />
      </template>
      <template v-slot:item.number2="{ item }">
        <NumberChip :number="item.number2" />
      </template>
      <template v-slot:item.number3="{ item }">
        <NumberChip :number="item.number3" />
      </template>
      <template v-slot:item.number4="{ item }">
        <NumberChip :number="item.number4" />
      </template>
      <template v-slot:item.number5="{ item }">
        <NumberChip :number="item.number5" />
      </template>
      <template v-slot:item.number6="{ item }">
        <NumberChip :number="item.number6" />
      </template>
      <template v-slot:item.number7="{ item }">
        <NumberChip :number="item.number7" />
      </template>

      <template v-slot:item.bonus1="{ item }">
        <NumberChip :number="item.bonus1" />
      </template>
      <template v-slot:item.bonus2="{ item }">
        <NumberChip :number="item.bonus2" />
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
    selected: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
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
    selectedBacknumberTimes() {
      return this.backnumberTimes.filter((times) => {
        if (this.selected.length <= 0) {
          return true
        }
        const lotteryNumber = this.sortByNumber4Backnumber(times)
        const result = lotteryNumber.find((lottery) => {
          const result = this.selected.find(
            (item) => item.number === lottery.number && lottery.bonus === 0
          )
          return result !== undefined
        })
        return result !== undefined
      })
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
      return this.selectedBacknumberTimes.map((times) => {
        const item = {}
        item.times = `${times}回`
        this.sortByNumber4Backnumber(times).forEach((element, index) => {
          let key = ''
          if (index < this.getNumberCount) {
            key = `number${index + 1}`
          } else {
            key = `bonus${index - this.getNumberCount + 1}`
          }
          item[key] = element.number
        })
        return item
      })
    },
  },
  methods: {
    sortByNumber4Backnumber(times) {
      const arr = this.backnumber[times].concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return a.number - b.number
      })
      return arr
    },
    sortByNumber4Backnumber2(times) {
      const arr = this.backnumber[times].concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        let aOdd = a.number % 7
        aOdd = aOdd === 0 ? 7 : aOdd
        let bOdd = b.number % 7
        bOdd = bOdd === 0 ? 7 : bOdd
        if (aOdd === bOdd) {
          return a.number - b.number
        }
        return aOdd - bOdd
      })
      return arr
    },
  },
}
</script>
