export const state = () => ({
  loto6LatestTimes: 0,
  loto6LatestNumber: [],
  loto6LatestBonus: [],
  loto6Numbers: [],
  loto6Backnumber: {},
  loto7LatestTimes: 0,
  loto7LatestNumber: [],
  loto7LatestBonus: [],
  loto7Numbers: [],
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

  SET_LOTO6_BACKNUMBER(state, backnumber) {
    state.loto6Backnumber = backnumber
  },
  SET_LOTO7_BACKNUMBER(state, backnumber) {
    state.loto7Backnumber = backnumber
  },
}

export const actions = {
  async setLoto6Latest({ commit }) {
    const { data } = await this.$axios.get('/loto/6/latest')
    commit('SET_LOTO6_LATEST', data)
  },
  async setLoto7Latest({ commit }) {
    const { data } = await this.$axios.get('/loto/7/latest')
    commit('SET_LOTO7_LATEST', data)
  },

  async setLoto6Numbers({ commit }) {
    const { data } = await this.$axios.get('/loto/6/count')
    commit('SET_LOTO6_NUMBERS', data.nums)
  },
  async setLoto7Numbers({ commit }) {
    const { data } = await this.$axios.get('/loto/7/count')
    commit('SET_LOTO7_NUMBERS', data.nums)
  },

  async setLoto6Backnumber({ commit, state }, { max }) {
    const backnumber = {}
    for (let i = 0; i < max; i++) {
      const times = state.loto6LatestTimes - i
      const { data } = await this.$axios.get(`/loto/6/${times}`)
      backnumber[data.times] = data.nums
    }
    commit('SET_LOTO6_BACKNUMBER', backnumber)
  },
  async setLoto7Backnumber({ commit, state }, { max }) {
    const backnumber = {}
    for (let i = 0; i < max; i++) {
      const times = state.loto7LatestTimes - i
      const { data } = await this.$axios.get(`/loto/7/${times}`)
      backnumber[data.times] = data.nums
    }
    commit('SET_LOTO7_BACKNUMBER', backnumber)
  },
}
