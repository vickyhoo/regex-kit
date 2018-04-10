<template>
  <div class="wrap">
    <v-layout row :class="wrapCls">
      <v-flex class="side-container regex-wrap">
        /
      </v-flex>
      <v-flex class="pattern-container">
        <pattern-editor @focus="onFocus" @blur="onBlur" />
      </v-flex>
      <v-flex class="side-container regex-wrap">
        /{{flags}}
      </v-flex>
      <v-flex class="side-container">
        <flags-editor />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FlagsEditor from './FlagsEditor';
import PatternEditor from './PatternEditor';

export default {
  name: 'expression-editor',
  components: {
    FlagsEditor,
    PatternEditor
  },
  data() {
    return {
      focus: false
    };
  },
  computed: {
    ...mapGetters({
      flags: 'patternFlags'
    }),
    wrapCls() {
      return !this.focus ? 'exp-wrap' : 'exp-wrap focus';
    }
  },
  methods: {
    onFocus() {
      this.focus = true;
    },
    onBlur() {
      this.focus = false;
    }
  }
};
</script>

<style>
.wrap {
  padding: 4px;
}
.exp-wrap {
  border: 1px solid #bdbdbd;
  outline: 0;
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
.exp-wrap.focus {
  border-color: #457abb;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 5px rgba(69, 122, 187, 0.5);
}
.side-container {
  flex: 0 0 auto;
}

.pattern-container {
  flex: auto;
  position: relative;
}

.regex-wrap {
  color: #c5c5c5;
  margin-top: 4px;
  font-family: Monaco, Consolas, Andale Mono, Lucida Console, PT Mono, Courier New, monospace;
}
</style>
