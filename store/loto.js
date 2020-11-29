export const state = () => ({
  loto6LatestTimes: 0,
  loto6LatestNumber: [],
  loto6LatestBonus: [],
  loto6Numbers: [],
  loto6NumInterval: [],
  loto6NumCombination: [],
  loto6Backnumber: {},
  loto7LatestTimes: 0,
  loto7LatestNumber: [],
  loto7LatestBonus: [],
  loto7Numbers: [],
  loto7NumInterval: [],
  loto7NumCombination: [],
  loto7Backnumber: {},
})

export const mutations = {
  SET_LOTO6_LATEST(state, latest) {
    state.loto6LatestTimes = latest.times
    state.loto6LatestNumber = latest.nums
    state.loto6LatestBonus = latest.bonus
  },
  SET_LOTO7_LATEST(state, latest) {
    state.loto7LatestTimes = latest.times
    state.loto7LatestNumber = latest.nums
    state.loto7LatestBonus = latest.bonus
  },

  SET_LOTO6_NUMBERS(state, arr) {
    state.loto6Numbers = arr
  },
  SET_LOTO7_NUMBERS(state, arr) {
    state.loto7Numbers = arr
  },

  SET_LOTO6_NUMINTERVAL(state, arr) {
    state.loto6NumInterval = arr
  },
  SET_LOTO7_NUMINTERVAL(state, arr) {
    state.loto7NumInterval = arr
  },

  SET_LOTO6_NUMCOMBINATION(state, arr) {
    state.loto6NumCombination = arr
  },
  SET_LOTO7_NUMCOMBINATION(state, arr) {
    state.loto7NumCombination = arr
  },

  SET_LOTO6_BACKNUMBER(state, backnumber) {
    state.loto6Backnumber = backnumber
  },
  SET_LOTO7_BACKNUMBER(state, backnumber) {
    state.loto7Backnumber = backnumber
  },
}

export const actions = {
  async setLoto6Latest({ commit }) {
    try {
      const { data } = await this.$axios.get('/loto/6/latest')
      commit('SET_LOTO6_LATEST', data)
    } catch (e) {
      commit('SET_LOTO6_LATEST', { times: 0, nums: [], bonus: [] })
    }
  },
  async setLoto7Latest({ commit }) {
    try {
      const { data } = await this.$axios.get('/loto/7/latest')
      commit('SET_LOTO7_LATEST', data)
    } catch (e) {
      commit('SET_LOTO7_LATEST', { times: 0, nums: [], bonus: [] })
    }
  },

  async setLoto6Numbers({ commit, state }) {
    await this.$axios
      .get('/loto/6/count')
      .then(({ data }) => {
        let luckyTotal = 0
        let luckyRecentTotal = 0
        data.nums.forEach((num) => {
          luckyTotal += num.luckyCount
          luckyRecentTotal += num.luckyRecentCount
        })
        luckyTotal /= 6
        luckyRecentTotal /= 6

        const nums = data.nums.map((num) => {
          num.timesDiff = state.loto6LatestTimes - num.luckyLast
          num.luckyRate =
            Math.floor((num.luckyCount / luckyTotal) * 100 * 100) / 100
          num.luckyRecentRate =
            Math.floor((num.luckyRecentCount / luckyRecentTotal) * 100 * 100) /
            100
          return num
        })
        commit('SET_LOTO6_NUMBERS', nums)
      })
      .catch((e) => {
        commit('SET_LOTO6_NUMBERS', [])
      })
  },
  async setLoto7Numbers({ commit, state }) {
    await this.$axios
      .get('/loto/7/count')
      .then(({ data }) => {
        let luckyTotal = 0
        let luckyRecentTotal = 0
        data.nums.forEach((num) => {
          luckyTotal += num.luckyCount
          luckyRecentTotal += num.luckyRecentCount
        })
        luckyTotal /= 7
        luckyRecentTotal /= 7

        const nums = data.nums.map((num) => {
          num.timesDiff = state.loto7LatestTimes - num.luckyLast
          num.luckyRate =
            Math.floor((num.luckyCount / luckyTotal) * 100 * 100) / 100
          num.luckyRecentRate =
            Math.floor((num.luckyRecentCount / luckyRecentTotal) * 100 * 100) /
            100
          return num
        })
        commit('SET_LOTO7_NUMBERS', nums)
      })
      .catch((e) => {
        commit('SET_LOTO7_NUMBERS', [])
      })
  },

  async setLoto6Backnumber({ commit }, { times, max }) {
    const backnumber = {}
    for (let i = 0; i < max; i++) {
      const targetTimes = times - i
      if (targetTimes <= 0) continue
      await this.$axios
        .get(`/loto/6/${targetTimes}`)
        .then(({ data }) => {
          backnumber[data.times] = data.nums
        })
        .catch((e) => {
          backnumber[targetTimes] = []
        })
    }
    commit('SET_LOTO6_BACKNUMBER', backnumber)
  },
  async setLoto7Backnumber({ commit }, { times, max }) {
    const backnumber = {}
    for (let i = 0; i < max; i++) {
      const targetTimes = times - i
      await this.$axios
        .get(`/loto/7/${targetTimes}`)
        .then(({ data }) => {
          backnumber[data.times] = data.nums
        })
        .catch((e) => {
          backnumber[targetTimes] = []
        })
    }
    commit('SET_LOTO7_BACKNUMBER', backnumber)
  },

  async setLoto6NumInterval({ commit }, { max }) {
    const numbers = []
    for (let i = 1; i <= max; i++) {
      await this.$axios
        .get(`/loto/6/interval/${i}`)
        .then(({ data }) => {
          numbers.push({
            number: data.num,
            times: data.times,
          })
        })
        .catch((e) => {
          numbers[i] = []
        })
    }
    commit('SET_LOTO6_NUMINTERVAL', numbers)
  },
  async setLoto7NumInterval({ commit }, { max }) {
    const numbers = []
    for (let i = 1; i <= max; i++) {
      await this.$axios
        .get(`/loto/7/interval/${i}`)
        .then(({ data }) => {
          numbers.push({
            number: data.num,
            times: data.times,
          })
        })
        .catch((e) => {
          numbers[i] = []
        })
    }
    commit('SET_LOTO7_NUMINTERVAL', numbers)
  },

  async setLoto6NumCombination({ commit }, { max }) {
    const numbers = []
    for (let i = 1; i <= max; i++) {
      await this.$axios
        .get(`/loto/6/combination/${i}`)
        .then(({ data }) => {
          numbers.push({
            number: data.num,
            combination: data.combination,
          })
        })
        .catch((e) => {
          numbers[i] = []
        })
    }
    commit('SET_LOTO6_NUMCOMBINATION', numbers)
  },
  async setLoto7NumCombination({ commit }, { max }) {
    const numbers = []
    for (let i = 1; i <= max; i++) {
      await this.$axios
        .get(`/loto/7/combination/${i}`)
        .then(({ data }) => {
          numbers.push({
            number: data.num,
            combination: data.combination,
          })
        })
        .catch((e) => {
          numbers[i] = []
        })
    }
    commit('SET_LOTO7_NUMCOMBINATION', numbers)
  },
}
