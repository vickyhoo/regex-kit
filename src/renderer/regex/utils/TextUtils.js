export function shorten(str, length) {
  if (!str) {
    return str;
  }
  if (str.length <= length) {
    return str;
  }
  return `${str.substr(0, length - 1)}\u2026`;
}

export function htmlSafe(str) {
  return str == null ? '' : `${str}`.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
