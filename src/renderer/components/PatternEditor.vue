<template>
  <codemirror
    class="pattern-editor"
    ref="cmEditor"
    :value="value"
    :options="cmOptions"
    @input="onCmChange"
  />
</template>

<script>
import 'codemirror/addon/display/placeholder';
import { mapGetters, mapActions } from 'vuex';
import ExpressionHighlighter from '@/regex/ExpressionHighlighter';
import ExpressionHover from '@/regex/ExpressionHover';
import { parsePattern } from './RegexUtils';

export default {
  name: 'pattern-editor',
  data() {
    return {
      cmOptions: {
        lineNumbers: false,
        tabSize: 2,
        indentWithTabs: false,
        placeholder: '(Type a regular expression)',
        lineWrapping: true
      }
    };
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    },
    ...mapGetters({
      value: 'patternValue'
    })
  },
  watch: {
    value: 'updateCodeMirror'
  },
  mounted() {
    const cm = this.codemirror;
    cm.setSize('100%', 'auto');

    // Hacky method to disable overwrite mode on expressions to avoid overwriting flags
    cm.toggleOverwrite = () => {};

    this.expressionHighlighter = new ExpressionHighlighter(cm);
    this.expressionHover = new ExpressionHover(cm, this.expressionHighlighter);

    this.updateCodeMirror();
  },
  methods: {
    ...mapActions({ onCmChange: 'changePattern' }),
    updateCodeMirror() {
      const pattern = this.value;
      const parsed = parsePattern(pattern);

      this.expressionHighlighter.draw(parsed.tree);
      this.expressionHover.token = parsed.token;
    }
  }
};
</script>

<style>

</style>
