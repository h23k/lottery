<template>
  <v-container>
    <v-banner sticky elevation="1" color="white" app>
      <v-layout align-center>
        <v-flex xs2 class="text-center">
          {{ latestDate }}<br />{{ latestTimes }}回
        </v-flex>
        <v-divider vertical></v-divider>
        <v-flex xs7 class="d-flex justify-space-around">
          <div v-for="number in latestNumber" :key="number">
            <NumberChip :number="Number(number)" :outlined="false" />
            <div class="text-body-2">
              {{ getInterval(latestTimes, number) }}回前
            </div>
          </div>
        </v-flex>
        <v-divider vertical></v-divider>
        <v-flex xs3 class="d-flex justify-space-around">
          <NumberChip
            v-for="bonus in latestBonus"
            :key="bonus"
            :number="Number(bonus)"
            :outlined="false"
          />
        </v-flex>
      </v-layout>
      <template v-if="selected.length">
        <v-divider class="my-3"></v-divider>
        <v-layout align-center>
          <v-flex xs2 class="text-center"> {{ latestTimes + 1 }}回 </v-flex>
          <v-divider vertical></v-divider>
          <v-flex class="text-center d-flex justify-space-around">
            <div v-for="num in selected" :key="num.number">
              <NumberChip :number="Number(num.number)" :outlined="false" />
              <div class="text-body-2">{{ num.interval }}回前</div>
            </div>
          </v-flex>
        </v-layout>
      </template>
    </v-banner>
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
        :backnumber-count="backnumbers.length"
        :interval-summary="intervalSummary"
        :numbers-interval="numbersInterval"
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
        @onLoad="getBacknumbers"
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
  </v-container>
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
    backnumbers: [],
    intervalSummary: [],
    numbersInterval: [],
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
    updateSelected({ number, interval, isSelected }) {
      if (isSelected) {
        this.selected.push({ number, interval })
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
    getBacknumbers(backnumbers) {
      this.backnumbers = backnumbers.backnumbers
      this.intervalSummary = backnumbers.intervalSummary
      this.numbersInterval = backnumbers.numbersInterval
    },
    getInterval(times, number) {
      const backnumber =
        this.backnumbers.find(
          (backnumber) => backnumber.times === String(times)
        ) || {}
      for (let i = 1; i <= this.getNumberCount; i++) {
        if (backnumber[`lucky${i}`] === Number(number)) {
          return backnumber[`interval${i}`]
        }
      }
      return '-'
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
