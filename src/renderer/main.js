import Vue from 'vue';
import Vuetify from 'vuetify';
import VueCodemirror from 'vue-codemirror';

import 'vuetify/dist/vuetify.css';
import 'codemirror/lib/codemirror.css';
import './scss/main.scss';

import App from './App';
import router from './router';
import store from './store';

Vue.use(Vuetify);
Vue.use(VueCodemirror);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
