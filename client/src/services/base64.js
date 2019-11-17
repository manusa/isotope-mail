// https://stackoverflow.com/a/30106551/999375
// https://tools.ietf.org/html/rfc4648#page-6 - Standard Base64 Alphabet
// https://tools.ietf.org/html/rfc4648#page-8 - Url Safe  Base64 Alphabet

export function unicodeUrlBtoa(string) {
  return btoa(encodeURIComponent(string).replace(/%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(`0x${p1}`)
  )).replace(/\+/g, '-').replace(/\//g, '_');
}

export function unicodeUrlAtob(string) {
  const replacedString = string.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(atob(replacedString)
    .split('')
    // eslint-disable-next-line prefer-template
    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    .join(''));
}

