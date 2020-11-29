<template>
  <v-col cols="12">
    <v-data-table
      v-model="selected"
      dense
      show-select
      :hide-default-footer="true"
      caption="出現間隔（最近）"
      :headers="numIntervalHeader"
      :items="numIntervalItems"
      :items-per-page="numIntervalItems.length"
      :sort-by="['current', 'number']"
      :sort-desc="[false, true]"
      item-key="number"
    >
      <template v-slot:item.number="{ item }">
        <NumberChip :number="item.number" />
      </template>
      <template v-slot:item.current="{ item }">
        <span v-if="isLargest(item)" style="color: red; font-weight: bold">
          {{ item.current }}
        </span>
        <span v-else>
          {{ item.current }}
        </span>
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
    selected: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data: () => ({
    intervalKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+'],
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
    numInterval() {
      return this.type === 6 ? this.loto6NumInterval : this.loto7NumInterval
    },
    numIntervalHeader() {
      const headers = [
        { text: '数字', value: 'number', align: 'center' },
        { text: '現在', value: 'current', align: 'right' },
      ]
      this.intervalKeys.forEach((val) => {
        headers.push({ text: `${val}回`, value: `${val}`, align: 'right' })
      })
      return headers
    },
    numIntervalItems() {
      return this.numInterval.map((element) => {
        const obj = { number: element.number }

        let prevTimes = this.latestTimes + 1
        element.times.forEach((times, i) => {
          const interval = prevTimes - times
          if (i === 0) {
            obj.current = interval
          } else {
            const key =
              this.intervalKeys.find((val) => val === String(interval)) ||
              this.intervalKeys.slice(-1)[0]
            obj[key] = (obj[key] || 0) + 1
          }
          prevTimes = times
        })

        return obj
      })
    },
  },
  mounted() {
    if (this.type === 6) {
      this.setLoto6NumInterval({ max: 43 })
    } else {
      this.setLoto7NumInterval({ max: 37 })
    }
  },
  methods: {
    ...mapActions('loto', ['setLoto6NumInterval', 'setLoto7NumInterval']),
    isLargest(item) {
      const curInterval =
        this.intervalKeys.find((val) => val === String(item.current)) ||
        this.intervalKeys.slice(-1)[0]
      const mostInterval = this.intervalKeys.reduce((acc, cur) => {
        return (item[acc] || 0) > (item[cur] || 0) ? acc : cur
      })
      return item[curInterval] === item[mostInterval]
    },
  },
}
</script>
