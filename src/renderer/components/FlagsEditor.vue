<template>
  <v-menu
    transition="slide-y-transition"
    bottom
  >
    <v-btn
      flat
      slot="activator"
    >
      /{{value}}
      <v-icon>flag</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile
          v-for="item in flagList"
          :key="item.key"
        >
          <v-list-tile-action>
            <v-icon
              v-if="value.indexOf(item.key) !== -1"
              color="pink"
            >done</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ item.desc }}</v-list-tile-sub-title>
          </v-list-tile>
      </v-list>
      </v-menu>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';

export default {
  name: 'flags-editor',
  computed: {
    ...mapGetters({
      value: 'patternFlags'
    }),
    ...mapState({
      flagList(state) {
        return state.pattern.flagList;
      }
    })
  }
};
</script>

<style>

</style>
