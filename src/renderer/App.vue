<template>
  <div id="app">
    <v-app :dark="dark">
      <v-toolbar app fixed clipped-left flat height="24" class="header">
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-content>
        <router-view></router-view>
      </v-content>
      <v-footer fixed app>
        <v-layout row wrap justify-center>
          <v-flex xs12 py-3 text-xs-center white--text>
            <v-btn flat small @click="open('https://github.com/vickyhoo/regex-kit')">Github</v-btn>
            <v-btn flat icon small @click="changeTheme" class="right">
              <v-icon small>invert_colors</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
export default {
  name: 'regex-kit',
  data() {
    return {
      dark: false
    };
  },
  computed: {
    theme() {
      return this.dark ? 'Light' : 'Dark';
    }
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    changeTheme() {
      this.dark = !this.dark;
    }
  }
};
</script>

<style scoped>
/* @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'); */
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
/* Global CSS */

.header {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.right {
  position: absolute;
  right: 0;
}
</style>
