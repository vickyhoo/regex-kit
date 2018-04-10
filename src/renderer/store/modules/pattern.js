const state = {
  value: '^(\\+\\d{1})?[\\s.-]?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s-.]?\\d{4}$',
  flags: ['gm'],
  flagList: [
    {
      key: 'g',
      title: 'global',
      desc: 'Don\'t retun after first match',
    },
    {
      key: 'm',
      title: 'multi line',
      desc: '^ and $ match start/end of line',
    },
    {
      key: 'i',
      title: 'insensitive',
      desc: 'Case insensitive match',
    },
  ]
};

const mutations = {
  changePattern(state, payload) {
    state.value = payload.pattern;
  }
};

const actions = {
  changePattern({ commit }, pattern) {
    commit('changePattern', { pattern });
  }
};

const getters = {
  patternValue(state) {
    return state.value;
  },
  patternFlags(state) {
    return state.flags.join('');
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};
