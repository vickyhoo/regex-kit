<template>
  <div class="text-wrap">
    <div :class="wrapCls">
      <canvas class="text-canvas" width="1" height="1" ref="textCanvas" />
      <div class="text-measure" ref="textMeasure">
        <codemirror class="text-editor" ref="cmEditor" :value="value" :options="cmOptions" @scroll="onCmScroll" @input="onCmChange" @focus="onCmFocus" @blur="onCmBlur" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { getCharIndexAt, getCharRect } from '@/regex/utils/CMUtils';
import Docs from '@/regex/utils/Docs';
import RegExJS from '@/regex/RegExJS';
import RegExLexer from '@/regex/RegExLexer';
import TextHighlighter from '@/regex/TextHighlighter';
import Tooltip from '@/regex/Tooltip';
import { getMatchAt } from './RegexUtils';

const { add: addTooltip } = Tooltip;

export default {
  name: 'text-editor',
  data() {
    return {
      focus: false,
      cmOptions: {
        tabSize: 2,
        indentWithTabs: false
      },
      hoverX: null,
      hoverY: null
    };
  },
  watch: {
    value: 'redraw'
  },
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    },
    wrapCls() {
      return !this.focus ? 'text-editor-container' : 'text-editor-container focus';
    },
    ...mapGetters({
      value: 'textValue',
      pattern: 'patternValue',
      flags: 'patternFlags'
    })
  },
  mounted() {
    this._exprLexer = new RegExLexer();

    const cm = this.codemirror;
    // We need some way of styling width/height
    // of this for sizing the cmEditor to 100%
    cm.setSize('100%', '100%');

    const themeColor = '#6CF';

    // Initialize source highlighter, tooltips
    this.sourceHighlighter = new TextHighlighter(cm, this.$refs.textCanvas, themeColor);
    this.sourceTooltip = addTooltip(cm.display.lineDiv);
    this.sourceTooltip.on('mousemove', this.handleMouseMove, this);
    this.sourceTooltip.on('mouseout', this.handleMouseOut, this);

    this.resizeCanvas();

    this._resizeListener = window.addEventListener('resize', this.resizeCanvas);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._resizeListener);
  },
  methods: {
    ...mapActions({ onCmChange: 'changeText' }),
    onCmScroll() {
      this.redraw();
    },
    onCmFocus() {
      this.focus = true;
    },
    onCmBlur() {
      this.focus = false;
    },
    resizeCanvas() {
      const rect = this.$refs.textMeasure.getBoundingClientRect();
      this.$refs.textCanvas.width = rect.right - rect.left || 0;
      this.$refs.textCanvas.height = rect.bottom - rect.top || 0;

      this.redraw();
    },
    redraw(text) {
      text = text || this.value;

      // Redraw text highlights
      this.getMatches(text, (error, matches) => {
        const hoverX = this.hoverX;
        const hoverY = this.hoverY;
        let hoverMatch = null;

        if (!error && hoverX && hoverY) {
          const cm = this.codemirror;
          // Check what index character we're hovering over
          const index = getCharIndexAt(cm, hoverX, hoverY);

          // See which match, if any, we're hovering over
          hoverMatch = index != null ? getMatchAt(matches, index) : null;

          if (hoverMatch) {
            const rect = index != null && getCharRect(cm, index);
            if (rect) {
              rect.right = rect.left = hoverX;
            }
            this.sourceTooltip.show(Docs.forMatch(hoverMatch), rect);
          } else {
            this.sourceTooltip.hide();
          }
        }

        this.sourceHighlighter.draw(error ? null : matches, hoverMatch, null);

        this.sendOnViewportChange(matches);
      });
    },

    /**
     * Send a call to the onViewportChange handler on scrolls,
     * changes in the content, etc.
     * @return { from, to, prevMatch, nextMatch }
     *         where from, to are both character counts, and
     *         prevMatch, nextMatch are the indexes of the
     *         first match before and after the visible section
     */
    sendOnViewportChange(matches) {
      if (!this.onViewportChange) return;

      const cm = this.codemirror;

      const viewport = cm.getScrollInfo();
      const left = viewport.left;
      const top = viewport.top;
      const right = viewport.left + viewport.clientWidth;
      const bottom = viewport.top + viewport.clientHeight;
      const firstChar = cm.indexFromPos(cm.coordsChar({ left, top }, 'local'));
      const lastChar = cm.indexFromPos(cm.coordsChar({ left: right, top: bottom }, 'local'));

      const processMatches = matches => {
        let prevMatch = null;
        let nextMatch = null;

        if (matches) {
          for (let i = 0; i !== matches.length; i++) {
            const match = matches[i];
            if (match.end < firstChar) {
              prevMatch = i;
            } else if (match.index > lastChar) {
              nextMatch = i;
              break;
            }
          }
        }

        const ret = {
          firstChar,
          lastChar,
          prevMatch,
          nextMatch
        };

        this.$emit('onViewportChange', ret);
      };

      if (matches) {
        processMatches(matches);
      } else {
        this.getMatches(this.value, (error, matches) => {
          processMatches(matches);
        });
      }
    },
    /**
     * Get the matches given the current regex (from
     * props.pattern and props.flags) and text
     * @param {String}   text   text to match against
     * @param {function} callback  callback that gets called with
     *                             (error, matches)
     */
    getMatches(text, callback) {
      // 1. Validate with lexing
      const pattern = this.pattern;
      const flags = this.flags;

      let regex = null;
      if (pattern) {
        // Don't allow empty regex: guaranteed infinite loop
        try {
          regex = new RegExp(pattern, flags);
        } catch (e) {
          // Invalid regexp
        }
      }

      if (!regex) {
        callback('invalid');
      } else {
        // To prevent regex DDoS, RegExr offloads to a
        // Web Worker
        RegExJS.match(regex, text, callback);
      }
    },
    handleCMScroll() {
      this.redraw();
    },
    handleMouseMove(event) {
      this.hoverX = event.clientX;
      this.hoverY = event.clientY;
      this.redraw();
    },
    handleMouseOut() {
      this.hoverX = null;
      this.hoverY = null;
    },
    /**
     * Scrolls to the nth match
     * (does nothing if the nth match doesn't exist)
     * @param {int} matchIndex    index of the match
     */
    scrollToMatch(matchIndex) {
      const cm = this.codemirror;
      this.getMatches(this.value, (error, matches) => {
        const match = matches[matchIndex];

        if (match) {
          cm.scrollIntoView({
            from: cm.posFromIndex(match.index),
            to: cm.posFromIndex(match.end)
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.text-wrap {
  height: calc(100% + 5px) !important;
  display: block;
  position: absolute;
  width: calc(100% - 8px);
}

.text-editor-container {
  width: 100%;
  height: 100%;
  outline: 0;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
}

.text-editor-container.focus {
  border-color: #457abb;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 5px rgba(69, 122, 187, 0.5);
}
.text-canvas {
  position: absolute;
  /* background: #f4f4f5; */
}

.text-measure {
  height: 100%;
  cursor: text;
}

.text-editor {
  height: 100%;
}
</style>
