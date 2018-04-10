export default class ExpressionHighlighter {
  static GROUP_CLASS_BY_TYPE = {
    set: 'exp-group-set',
    setnot: 'exp-group-set',
    group: 'exp-group-%depth%',
    lookaround: 'exp-group-%depth%'
  };

  constructor(cm, offset) {
    this.initialize(cm, offset);
  }

  cm = null;
  prefix = 'exp-';
  selectedToken = null;
  selectedMarks = null;
  activeMarks = null;
  offset = 0;

  initialize(cm, offset) {
    this.cm = cm;
    this.offset = offset || 0;
    this.activeMarks = [];
    this.selectedMarks = [];
  }

  draw(token) {
    const cm = this.cm;
    const pre = this.prefix;

    this.clear();
    cm.operation(() => {
      const groupClasses = ExpressionHighlighter.GROUP_CLASS_BY_TYPE;
      const doc = cm.getDoc();
      let endToken;
      const marks = this.activeMarks;

      while (token) {
        if (token.clear) {
          token = token.next;
          // eslint-disable-next-line
          continue;
        }
        token = this._calcTokenPos(doc, token);

        let className = pre + (token.clss || token.type);
        if (token.err) {
          className += ` ${pre}error`;
        }

        if (className) {
          marks.push(doc.markText(token.startPos, token.endPos, { className }));
        }

        if (token.close) {
          endToken = this._calcTokenPos(doc, token.close);
          className = groupClasses[token.clss || token.type];
          if (className) {
            className = className.replace('%depth%', token.depth);
            marks.push(doc.markText(token.startPos, endToken.endPos, { className }));
          }
        }
        token = token.next;
      }
    });
  }

  clear() {
    this.cm.operation(() => {
      const marks = this.activeMarks;
      for (let i = 0, l = marks.length; i < l; i++) {
        marks[i].clear();
      }
      marks.length = 0;
    });
  }

  selectToken(token) {
    if (token == this.selectedToken) {
      return;
    }
    if (token && token.set && token.set.indexOf(this.selectedToken) != -1) {
      return;
    }
    while (this.selectedMarks.length) {
      this.selectedMarks.pop().clear();
    }
    this.selectedToken = token;
    if (!token) {
      return;
    }

    if (token.open) {
      this._drawSelect(token.open);
    } else {
      this._drawSelect(token);
    }
    if (token.related) {
      for (let i = 0; i < token.related.length; i++) {
        this._drawSelect(token.related[i], 'exp-related');
      }
    }
  }

  _drawSelect(token, style) {
    let endToken = token.close || token;
    if (token.set) {
      endToken = token.set[token.set.length - 1];
      token = token.set[0];
    }
    style = style || 'exp-selected';
    const doc = this.cm.getDoc();
    this._calcTokenPos(doc, endToken);
    this._calcTokenPos(doc, token);
    this.selectedMarks.push(
      doc.markText(token.startPos, endToken.endPos, {
        className: style,
        startStyle: `${style}-left`,
        endStyle: `${style}-right`
      })
    );
  }

  _calcTokenPos(doc, token) {
    if (token.startPos || token == null) {
      return token;
    }
    token.startPos = doc.posFromIndex(token.i + this.offset);
    token.endPos = doc.posFromIndex(token.end + this.offset);
    return token;
  }
}
