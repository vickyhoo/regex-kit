const state = {
  value: '',
  flags: ['g'],
  flagList: [
    {
      key: 'g',
      title: 'global',
      desc: "Don't retun after first match"
    },
    {
      key: 'm',
      title: 'multi line',
      desc: '^ and $ match start/end of line'
    },
    {
      key: 'i',
      title: 'insensitive',
      desc: 'Case insensitive match'
    }
  ]
};

const mutations = {
  changePattern(state, payload) {
    state.value = payload.pattern;
  },
  changeFlags(state, payload) {
    if (!state.flags.includes(payload.flag)) {
      state.flags = [...state.flags, payload.flag];
    } else {
      state.flags = state.flags.filter(f => f !== payload.flag);
    }
  }
};

const actions = {
  changePattern({ commit }, pattern) {
    commit('changePattern', { pattern });
  },
  changeFlags({ commit }, flag) {
    commit('changeFlags', { flag });
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
