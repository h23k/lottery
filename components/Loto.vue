<template>
  <div>
    <v-row>
      <v-col>
        <v-card elevation="1">
          <v-card-title>前回結果</v-card-title>
          <v-card-text>
            <v-layout align-center>
              <v-flex xs2 class="text-center">
                {{ latestDate }}<br />{{ latestTimes }}回
              </v-flex>
              <v-divider vertical></v-divider>
              <v-flex xs7 class="d-flex justify-space-around">
                <span v-for="number in latestNumber" :key="number">
                  {{ number }}
                </span>
              </v-flex>
              <v-divider vertical></v-divider>
              <v-flex xs3 class="d-flex justify-space-around">
                <span v-for="bonus in latestBonus" :key="bonus">
                  {{ bonus }}
                </span>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mb-10">
      <LotoCountChart :type="type" />
    </v-row>
    <v-row class="mb-10">
      <LotoBacknumberChart :type="type" />
    </v-row>
    <v-row class="mb-10">
      <LotoCount
        :type="type"
        :selected="selected"
        :backnumber-count="backnumberIntervals.backnumberCount"
        :interval-summary="backnumberIntervals.backnumberIntervalItems"
        :intervals="backnumberIntervals.backnumberNumberItems"
        @onLoad="getNumbers"
        @setSelected="updateSelected"
      />
    </v-row>
    <v-row class="mb-10">
      <LotoInterval :type="type" :selected="selected" @onLoad="getIntervals" />
    </v-row>
    <v-row class="mb-10">
      <LotoBacknumber
        :type="type"
        :selected="selected"
        @onLoad="getBacknumberIntervals"
      />
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  props: {
    type: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    selected: [],
    numbers: [],
    intervals: [],
    backnumberIntervals: {},
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
      'loto6LatestDate',
      'loto6LatestNumber',
      'loto6LatestBonus',
      'loto7LatestTimes',
      'loto7LatestDate',
      'loto7LatestNumber',
      'loto7LatestBonus',
    ]),
    latestTimes() {
      return this.type === 6 ? this.loto6LatestTimes : this.loto7LatestTimes
    },
    latestDate() {
      return this.type === 6 ? this.loto6LatestDate : this.loto7LatestDate
    },
    latestNumber() {
      return this.type === 6 ? this.loto6LatestNumber : this.loto7LatestNumber
    },
    latestBonus() {
      return this.type === 6 ? this.loto6LatestBonus : this.loto7LatestBonus
    },
  },
  mounted() {
    if (this.type === 6) {
      this.setLoto6Latest()
        .then(() => {
          this.setLoto6Numbers()
        })
        .then(() => {
          this.setLoto6NumInterval({ max: 43 })
        })
        .then(() => {
          this.setLoto6NumCombination({ max: 43 })
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
          this.setLoto7NumInterval({ max: 37 })
        })
        .then(() => {
          this.setLoto7NumCombination({ max: 37 })
        })
        .then(() => {
          this.setLoto7Backnumber({ times: this.latestTimes, max: 52 })
        })
    }
  },
  methods: {
    ...mapActions('loto', [
      'setLoto6Latest',
      'setLoto6Numbers',
      'setLoto6NumInterval',
      'setLoto6NumCombination',
      'setLoto6Backnumber',
      'setLoto7Latest',
      'setLoto7Numbers',
      'setLoto7NumInterval',
      'setLoto7NumCombination',
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
    updateSelected({ number, isSelected }) {
      if (isSelected) {
        this.selected.push({ number })
      } else {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i].number === number) {
            this.selected.splice(i, 1)
            break
          }
        }
      }
    },
    getNumbers(numbers) {
      this.numbers = numbers
    },
    getIntervals(intervals) {
      this.intervals = intervals
    },
    getBacknumberIntervals(backnumberIntervals) {
      this.backnumberIntervals = backnumberIntervals
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
