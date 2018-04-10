const state = {
  value: ''
};

const mutations = {
  changeText(state, payload) {
    state.value = payload.text;
  }
};

const actions = {
  changeText({ commit }, text) {
    commit('changeText', { text });
  }
};

const getters = {
  textValue(state) {
    return state.value;
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
