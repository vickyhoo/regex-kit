export function getCharIndexAt(cm, winX, winY) {
  const pos = cm.coordsChar({ left: winX, top: winY }, 'page');
  // test current and prev character,
  // since CM seems to use the center of each character for coordsChar:
  for (let i = 0; i <= 1; i++) {
    const rect = cm.charCoords(pos, 'page');
    if (winX >= rect.left && winX <= rect.right && winY >= rect.top && winY <= rect.bottom) {
      return cm.indexFromPos(pos);
    }
    if (pos.ch-- <= 0) {
      break;
    }
  }
  return null;
}

export function getEOLPos(cm, pos) {
  if (!isNaN(pos)) {
    pos = cm.posFromIndex(pos);
  }
  const rect = cm.charCoords(pos, 'local');
  const w = cm.getScrollInfo().width;
  return cm.coordsChar({ left: w - 1, top: rect.top }, 'local');
}

export function getCharRect(cm, index) {
  if (index == null) {
    return null;
  }
  const pos = cm.posFromIndex(index);
  const rect = cm.charCoords(pos);
  rect.x = rect.left;
  rect.y = rect.top;
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  return rect;
}

export function enforceMaxLength(cm, change) {
  const maxLength = cm.getOption('maxLength');
  if (maxLength && change.update) {
    let str = change.text.join('\n');
    let delta = str.length - (cm.indexFromPos(change.to) - cm.indexFromPos(change.from));
    if (delta <= 0) {
      return true;
    }
    // eslint-disable-next-line
    delta = cm.getValue().length + delta - maxLength;
    if (delta > 0) {
      str = str.substr(0, str.length - delta);
      change.update(change.from, change.to, str.split('\n'));
    }
  }
  return true;
}

export function enforceSingleLine(cm, change) {
  if (change.update) {
    const str = change.text.join('').replace(/(\n|\r)/g, '');
    change.update(change.from, change.to, [str]);
  }
  return true;
}
