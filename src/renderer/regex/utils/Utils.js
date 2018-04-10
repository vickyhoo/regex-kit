export const isMac = () => /Mac\sOS/i.test(window.navigator.userAgent);

export const getCtrlKey = () => (isMac() ? 'Cmd' : 'Ctrl');

export const fillTags = (str, data, functs) => {
  let match;
  let val;
  let f;
  // eslint-disable-next-line
  while ((match = str.match(/{{[\w.()]+}}/))) {
    val = match[0].substring(2, match[0].length - 2);
    const match2 = val.match(/\([\w.]*\)/);
    if (match2) {
      f = val.substr(0, match2.index);
      val = match2[0].substring(1, match2[0].length - 1);
    } else {
      f = null;
    }
    let o = data;
    const arr = val.split('.');
    for (let i = 0; i < arr.length; i++) {
      const prop = arr[i];
      if (prop) {
        o = o[prop];
      }
    }
    val = o;
    if (f) {
      val = functs[f](val);
    }
    str = str.replace(match[0], val);
  }
  return str;
};

export const removeClass = (element, className) => {
  if (className instanceof RegExp) {
    const arr = element.className.split(' ');
    const re = className;
    element.className = arr.filter(s => !re.test(s)).join(' ');
  } else {
    const list = element.classList;
    list.remove(...className.split(' '));
  }
  return element;
};

export const addClass = (element, className) => {
  removeClass(element, className);

  const names = className.split(' ');
  for (let i = 0; i < names.length; i++) {
    element.classList.add(names[i]);
  }

  return element;
};
