export default class TextHighlighter {
  constructor(cm, canvas, fill) {
    this.initialize(cm, canvas, fill);
  }

  cm = null;
  canvas = null;
  fill = '#6CF';
  lineSpacing = 2;
  lastBottom = -1;
  lastRight = -1;

  initialize(cm, canvas, fill) {
    this.cm = cm;
    this.canvas = canvas;
    this.fill = fill || this.fill;
  }

  draw(matches, activeMatch, selectedMatch) {
    this.clear();
    if (!matches || !matches.length) {
      return;
    }

    const cm = this.cm;
    const doc = cm.getDoc();
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = this.fill;

    // find the range of the visible text:
    const scroll = cm.getScrollInfo();
    const top = cm.indexFromPos(
      cm.coordsChar(
        {
          left: scroll.left,
          top: scroll.top
        },
        'local'
      )
    );
    const bottom = cm.indexFromPos(
      cm.coordsChar(
        {
          left: scroll.left + scroll.clientWidth,
          top: scroll.top + scroll.clientHeight
        },
        'local'
      )
    );

    for (let i = 0, l = matches.length; i < l; i++) {
      const match = matches[i];
      const start = match.index;
      const end = match.end;
      if (start > bottom) {
        break;
      } // all done.
      if (end < top) {
        // eslint-disable-next-line
        continue;
      } // not visible, so don't mark.
      const startPos = match.startPos || (match.startPos = doc.posFromIndex(start));
      const endPos = match.endPos || (match.endPos = doc.posFromIndex(end));
      const active = match === activeMatch;
      const selected = match === selectedMatch;

      if (active || selected) {
        ctx.globalAlpha = 0.45;
      }

      const startRect = cm.charCoords(startPos, 'local');
      const endRect = cm.charCoords(endPos, 'local');

      if (startRect.bottom == endRect.bottom) {
        this.drawHighlight(
          ctx,
          startRect.left,
          startRect.top,
          endRect.right,
          endRect.bottom,
          scroll.left,
          scroll.top
        );
      } else {
        const lw = cm.getScrollInfo().width;
        const lh = cm.defaultTextHeight();
        // render first line:
        this.drawHighlight(
          ctx,
          startRect.left,
          startRect.top,
          lw - 2,
          startRect.bottom,
          scroll.left,
          scroll.top,
          false,
          true
        ); // startRect.top+lh
        // render lines in between:
        let y = startRect.top;
        // eslint-disable-next-line
        while ((y += lh) < endRect.top - 1) {
          // the -1 is due to fractional issues on FF
          this.drawHighlight(
            ctx,
            0,
            y,
            lw - 2,
            y + startRect.bottom - startRect.top,
            scroll.left,
            scroll.top,
            true,
            true
          ); // lh
        }
        // render last line:
        this.drawHighlight(
          ctx,
          0,
          endRect.top,
          endRect.right,
          endRect.bottom,
          scroll.left,
          scroll.top,
          true
        );
        // CMUtils.getEOLPos(this.sourceCM, startPos);
      }

      if (active || selected) {
        ctx.globalAlpha = 1;
      }
    }
  }

  drawHighlight(ctx, left, top, right, bottom, scrollX, scrollY, startCap, endCap) {
    const capW = 4;

    if (right < 0 || left + 1 >= right) {
      return;
    } // weird bug in CodeMirror occasionally returns negative values
    left = (left + 0.5) | 0;
    right = (right + 0.5) | 0;
    top = ((top + 0.5) | 0) + this.lineSpacing;
    bottom = (bottom + 0.5) | 0;

    if (top + 1 > this.lastBottom) {
      this.lastBottom = bottom;
    } else if (left < this.lastRight) {
      left = this.lastRight;
    }
    this.lastRight = right;

    const a = ctx.globalAlpha;
    if (startCap) {
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect((left + 1 || 0) - scrollX, top - scrollY, capW + 1, bottom - top);
      left += capW;
    }
    if (endCap) {
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect((right - capW - 1 || 0) - scrollY, top - scrollY, capW + 1, bottom - top);
      right -= capW;
    }
    ctx.globalAlpha = a;
    ctx.fillRect(left + 1 - scrollX, top - scrollY, right - left - 1, bottom - top);
  }

  clear() {
    this.canvas.width = this.canvas.width;
    this.lastBottom = -1;
  }
}
