import documentation from '../documentation';
import { htmlSafe, shorten } from './TextUtils';
import { getCtrlKey, fillTags } from './Utils';

const Docs = {};

Docs.NONPRINTING_CHARS = {
  0: 'NULL',
  1: 'SOH',
  2: 'STX',
  3: 'ETX',
  4: 'EOT',
  5: 'ENQ',
  6: 'ACK',
  7: 'BELL',
  8: 'BS',
  9: 'TAB', //
  10: 'LINE FEED', //
  11: 'VERTICAL TAB',
  12: 'FORM FEED',
  13: 'CARRIAGE RETURN', //
  14: 'SO',
  15: 'SI',
  16: 'DLE',
  17: 'DC1',
  18: 'DC2',
  19: 'DC3',
  20: 'DC4',
  21: 'NAK',
  22: 'SYN',
  23: 'ETB',
  24: 'CAN',
  25: 'EM',
  26: 'SUB',
  27: 'ESC',
  28: 'FS',
  29: 'GS',
  30: 'RS',
  31: 'US',
  32: 'SPACE', //
  127: 'DEL'
};

Docs.content = null;
Docs.ids = null;

Docs.setContent = content => {
  Docs.content = content;
  const ids = {};
  const parseContent = (content, o) => {
    const kids = content.kids;
    if (content.id) {
      ids[content.id] = content;
      if (o) {
        o[content.id] = content;
      }
    }
    if (kids) {
      o = content.ids = {};
      for (let i = 0, l = kids.length; i < l; i++) {
        parseContent(kids[i], o);
        kids[i].parent = content;
      }
    }
  };
  parseContent(content.library);
  parseContent(content.misc);
  Docs.ids = ids;
};

Docs.getItem = id => Docs.ids[id];

Docs.forMatch = match => {
  if (!match) {
    return null;
  }
  let str = `<b>match: </b>${htmlSafe(shorten(match[0], 150))}<br/><b>range: </b>${match.index}-${
    match.end
  }`;
  const l = match.length;
  if (l > 1) {
    str += '<hr/>';
  }
  for (let i = 1; i < l; i++) {
    if (i > 1) {
      str += '<br/>';
    }
    str += `<b>group #${i}: </b>${htmlSafe(shorten(match[i], 40))}`;
  }
  return str;
};

Docs.forToken = token => {
  let pre = '';
  const post = '';
  let label = '';
  const docs = Docs.content;
  if (!token) {
    return null;
  }
  if (token.open) {
    token = token.open;
  }
  if (token.err) {
    return `<span class='error-title'>ERROR: </span>${docs.errors[token.err]}` || `[${token.err}]`;
  }

  const type = token.type;
  const clss = token.clss;
  const ids = Docs.ids;
  const id = type;

  let node = ids[id];
  if (node) {
    label = token.label || node.label || node.id;
    if (id == 'group') {
      label += ` #${token.num}`;
    }
    label = `<b>${label[0].toUpperCase()}${label.substr(1)}.</b> `;
  }

  // Special cases:
  if (clss == 'quant') {
    node = ids[clss];
  }
  if (type == 'char' || clss == 'esc') {
    if (clss == 'esc') {
      pre = `${(ids[type] && ids[type].desc) || '<b>Escaped character.</b>'} `;
    }
    node = ids[token.js ? 'js_char' : 'char'];
  }

  const tip = node ? node.tip || node.desc : `no docs for type='${type}'`;
  return label + pre + fillTags(tip, token, Docs) + post;
};

Docs.forErrorResult = (type, errors) => {
  const node = Docs.ids[type];
  return `<span class='error-title'>ERROR: </span>${node.tip || node.desc}`;
};

Docs.getDesc = id => {
  const node = Docs.ids[id];
  return (node && node.desc) || `Content not found:${id}`;
};

Docs.getQuant = token => {
  const min = token.min;
  const max = token.max;
  // eslint-disable-next-line
  return min == max ? min : max == -1 ? `${min} or more` : `between ${min} and ${max}`;
};

Docs.getChar = token => {
  const chr = Docs.NONPRINTING_CHARS[token.code];
  return chr || `"${String.fromCharCode(token.code)}"`;
};

Docs.getEscCharDocs = (c, t, template) => {
  const code = c.charCodeAt(0);
  const chr = Docs.NONPRINTING_CHARS[code] || c;
  return {
    token: `\\${t || c}`,
    label: chr.toLowerCase(),
    desc: fillTags(template, { code }, Docs)
  };
};

Docs.getCtrlKey = () => getCtrlKey();

// Inject text from the documentation file.
(function injectText() {
  // add escaped characters to the reference:
  const reference = documentation.library.kids[0];
  const chars = '\t\n\v\f\r\0.\\+*?^$[]{}()|/';
  const tokens = 'tnvfr0';
  const kids = reference.kids[2].kids;
  for (let i = 0; i < chars.length; i++) {
    kids.push(Docs.getEscCharDocs(chars[i], tokens[i], documentation.misc.kids[0].tip));
  }

  Docs.setContent({
    errors: documentation.errors,
    library: documentation.library,
    misc: documentation.misc
  });
}());

export default Docs;
