<template>
  <div>
    <v-row>
      <v-col cols="6">
        <v-data-table
          dense
          :hide-default-footer="true"
          caption="全体"
          :headers="[
            { text: '数字', value: 'number', align: 'center' },
            { text: '出現回数', value: 'luckyCount', align: 'right' },
            { text: '出現率', value: 'luckyRate', align: 'right' },
            { text: '出現差', value: 'timesDiff', align: 'right' },
          ]"
          :items="numbers"
          :items-per-page="numbers.length"
          :sort-by="['timesDiff', 'luckyCount', 'number']"
          :sort-desc="[false, true, false]"
          item-key="number"
        >
          <template v-slot:item.number="{ item }">
            <NumberChip :number="item.number" />
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="6">
        <v-data-table
          v-model="selected"
          dense
          show-select
          :hide-default-footer="true"
          caption="最近"
          :headers="[
            { text: '数字', value: 'number', align: 'center' },
            { text: '出現回数', value: 'luckyRecentCount', align: 'right' },
            { text: '出現率', value: 'luckyRecentRate', align: 'right' },
            { text: '出現差', value: 'timesDiff', align: 'right' },
          ]"
          :items="numbers"
          :items-per-page="numbers.length"
          :sort-by="['luckyRecentCount', 'timesDiff', 'number']"
          :sort-desc="[true, false, false]"
          item-key="number"
        >
          <template v-slot:item.number="{ item }">
            <NumberChip :number="item.number" />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <LotoInterval :type="type" :selected="selected" />
    </v-row>
    <v-row>
      <LotoCombination
        v-for="obj in selected"
        :key="obj.number"
        :type="type"
        :number="obj.number"
        :selected="selected"
      />
    </v-row>
    <v-row>
      <LotoBacknumber :type="type" :selected="selected" />
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import NumberChip from '@/components/NumberChip'
import LotoInterval from '@/components/LotoInterval'
import LotoCombination from '@/components/LotoCombination'
import LotoBacknumber from '@/components/LotoBacknumber'

export default {
  components: {
    NumberChip,
    LotoInterval,
    LotoCombination,
    LotoBacknumber,
  },
  props: {
    type: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    selected: [],
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
      'loto6LatestNumber',
      'loto6LatestBonus',
      'loto6Numbers',
      'loto7LatestTimes',
      'loto7LatestNumber',
      'loto7LatestBonus',
      'loto7Numbers',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    latestNumber() {
      return this.type === 6 ? this.loto6LatestNumber : this.loto7LatestNumber
    },
    latestBonus() {
      return this.type === 6 ? this.loto6LatestBonus : this.loto7LatestBonus
    },
    numbers() {
      return this.type === 6 ? this.loto6Numbers : this.loto7Numbers
    },
  },
  mounted() {
    if (this.type === 6) {
      this.setLoto6Latest()
        .then(() => {
          this.setLoto6Numbers()
        })
        .then(() => {
          this.setLoto6Backnumber({ times: this.latestTimes, max: 104 })
        })
    } else {
      this.setLoto7Latest()
        .then(() => {
          this.setLoto7Numbers()
        })
        .then(() => {
          this.setLoto7Backnumber({ times: this.latestTimes, max: 52 })
        })
    }
  },
  methods: {
    toggleChecked(event) {
      const target = event.target
      target.classList.toggle('checked')
    },
    ...mapActions('loto', [
      'setLoto6Latest',
      'setLoto6Numbers',
      'setLoto6Backnumber',
      'setLoto7Latest',
      'setLoto7Numbers',
      'setLoto7Backnumber',
    ]),
    getInterval(times) {
      return Math.abs(this.latestTimes - times)
    },
    getIntervalClassName(interval) {
      if (interval === 0) {
        return 'latest'
      } else if (interval === 1) {
        return 'level1'
      } else if (interval === 2 || interval === 3) {
        return 'level2'
      } else if (interval === 4 || interval === 5) {
        return 'level3'
      } else if (interval >= 6 && interval <= 10) {
        return 'level4'
      } else if (interval >= 11) {
        return 'level5'
      } else {
        return ''
      }
    },
    sortByInterval4Backnumber(times) {
      const arr = this.backnumber[times].concat()
      arr.sort(function (a, b) {
        if (a.bonus === 1 || b.bonus === 1) {
          return -1
        }
        return b.last - a.last
      })
      return arr
    },
    getInterval4Backnumber(num, times) {
      const nums = this.backnumber[times]
      const obj = nums.find((element) => num === element.number)
      if (obj !== undefined) {
        return times - obj.last
      } else {
        return null
      }
    },
    getBacknumberTotalCount(times) {
      const index = this.backnumberTimes.indexOf(times)
      const nums = this.backnumberTimes.slice(index)
      return nums.length
    },
  },
}
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  border: 1px solid #1b1b1b;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background-color: #808080;
    border: 1px solid #1b1b1b;
    padding: 5px;
    color: #070707;
    white-space: nowrap;
    user-select: none;

    &.checked {
      background-color: gold;
      color: #eb5757;
    }
  }
  td {
    background: var(--main-bg-color);
    border: 1px solid #1b1b1b;
    padding: 5px;
    text-align: right;
    white-space: nowrap;

    &.latest {
      background: #eb5757;
      font-weight: bold;
    }
    &.level1 {
      background: #f2994a;
      font-weight: bold;
    }
    &.level2 {
      background: #f2c94c;
      font-weight: bold;
    }
    &.level3 {
      background: #27ae60;
      font-weight: bold;
    }
    &.level4 {
      background: #56ccf2;
      font-weight: bold;
    }
    &.level5 {
      background: #bb6bd9;
      font-weight: bold;
    }
    &.bonus {
      background: var(--main-bg-color);
      font-weight: normal;
    }
  }

  thead {
    th {
      background-clip: padding-box;
      position: sticky;
      top: 0;
      z-index: 1;
      &:first-child {
        left: 0;
        z-index: 2;
      }
    }
  }
  tbody {
    th {
      background-clip: padding-box;
      position: sticky;
      left: 0;
      z-index: 0;
    }
  }
}

.number {
  padding-bottom: 15px;
  overflow-x: auto;

  table {
    thead {
      th {
        &:nth-child(n + 2) {
          cursor: pointer;
        }
      }
    }
    tbody {
      tr {
        &:nth-child(1) {
          th {
            &:nth-child(2) {
              left: 52.55px;
            }
          }
        }
        &:nth-child(2),
        &:nth-child(3) {
          th {
            left: 52.55px;
          }
        }
      }
    }
  }
}

.times {
  // height: 380px;
  // overflow-y: auto;
  // margin-right: -15px;
  // padding-right: 15px;
  margin-top: 15px;

  table {
    tbody {
      td {
        text-align: center;
      }
    }
  }
}
</style>
