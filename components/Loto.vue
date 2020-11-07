<template>
  <div>
    <div class="number">
      <table>
        <thead>
          <tr>
            <th colspan="2">数字</th>
            <th v-for="num in numbers" :key="num.number" @click="toggleChecked">
              {{ num.number }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th rowspan="3">本数字</th>
            <th>回数</th>
            <td v-for="num in numbers" :key="num.number">
              {{ num.luckyCount }}回
            </td>
          </tr>
          <tr>
            <th>最近</th>
            <td v-for="num in numbers" :key="num.number">
              {{ num.luckyRecentCount }}回
            </td>
          </tr>
          <tr>
            <th>前回</th>
            <td
              v-for="num in numbers"
              :key="num.number"
              :class="[getIntervalClassName(getInterval(num.luckyLast))]"
            >
              {{ getInterval(num.luckyLast) }}回前
            </td>
          </tr>
          <tr>
            <th colspan="2">ボーナス</th>
            <td
              v-for="num in numbers"
              :key="num.number"
              :class="{ latest: getInterval(num.bonusLast) === 0 }"
            >
              {{ getInterval(num.bonusLast) }}回前
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="times">
      <table>
        <thead>
          <tr>
            <th>開催回</th>
            <th :colspan="getNumberCount">本数字</th>
            <th :colspan="getBonusCount">ボーナス数字</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="times in backnumberTimes" :key="times">
            <th>{{ times }}回</th>
            <td
              v-for="num in sortByInterval4Backnumber(times)"
              :key="num.number"
              :class="[
                { bonus: num.bonus === 1 },
                getIntervalClassName(
                  getInterval4Backnumber(num.number, times) - 1
                ),
              ]"
            >
              {{ num.number }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
      'loto6Backnumber',
      'loto7LatestTimes',
      'loto7LatestNumber',
      'loto7LatestBonus',
      'loto7Numbers',
      'loto7Backnumber',
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
    backnumber() {
      return this.type === 6 ? this.loto6Backnumber : this.loto7Backnumber
    },
    backnumberTimes() {
      const keys = Object.keys(this.backnumber)
      return keys.sort().reverse()
    },
  },
  mounted() {
    if (this.type === 6) {
      this.setLoto6Latest()
        .then(() => {
          this.setLoto6Numbers()
        })
        .then(() => {
          this.setLoto6Backnumber({ max: 100 })
        })
    } else {
      this.setLoto7Latest()
        .then(() => {
          this.setLoto7Numbers()
        })
        .then(() => {
          this.setLoto7Backnumber({ max: 50 })
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
  height: 380px;
  margin-top: 15px;
  margin-right: -15px;
  padding-right: 15px;
  overflow-y: auto;

  table {
    tbody {
      td {
        text-align: center;
      }
    }
  }
}
</style>
