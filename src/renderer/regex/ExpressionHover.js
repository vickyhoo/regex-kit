import Tooltip from './Tooltip';
import { getCharIndexAt, getCharRect } from './utils/CMUtils';
import Docs from './utils/Docs';

const { add: addTooltip } = Tooltip;

export default class ExpressionHover {
  constructor(cm, highlighter) {
    this.initialize(cm, highlighter);
  }

  cm = null;
  tooltip = null;
  highlighter = null;
  token = null;
  offset = 0;
  isMouseDown = false;

  initialize(cm, highlighter) {
    this.cm = cm;
    this.highlighter = highlighter;
    this.offset = highlighter.offset;

    this.tooltip = addTooltip(cm.display.lineDiv, null, { className: 'expr' });
    this.tooltip.on('mousemove', this.onMouseMove, this);
    this.tooltip.on('mouseout', this.onMouseOut, this);

    cm.on('mousedown', this.onMouseDown);
  }

  onMouseDown = (cm, evt) => {
    if (evt.which != 1 && evt.button != 1) {
      return;
    }
    this.onMouseMove(); // clear current
    this.isMouseDown = true;
    let f;
    const t = window.addEventListener ? window : document;
    t.addEventListener(
      'mouseup',
      (f = () => {
        t.removeEventListener('mouseup', f);
        this.isMouseDown = false;
      })
    );
  };

  onMouseMove = evt => {
    if (this.isMouseDown) {
      return;
    }
    let index;
    const cm = this.cm;
    let token = this.token;
    let target = null;

    // eslint-disable-next-line
    if (
      evt &&
      token &&
      (index = getCharIndexAt(cm, evt.clientX, evt.clientY + window.pageYOffset)) != null
    ) {
      index -= this.offset;
      while (token) {
        if (index >= token.i && index < token.end) {
          target = token;
          break;
        }
        token = token.next;
      }
    }
    if (target && target.proxy) {
      target = target.proxy;
    }

    this.highlighter.selectToken(target);
    const rect = index != null && getCharRect(cm, index);
    if (rect) {
      rect.right = rect.left = evt.clientX;
    }
    this.tooltip.show(Docs.forToken(target), rect);
  };

  onMouseOut = () => {
    this.highlighter.selectToken(null);
  };
}
