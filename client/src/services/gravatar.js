import md5 from './md5';

const BASE_URL = 'https://www.gravatar.com';

export function imageUrl(email, options = {}) {
  const hash = md5(email.trim().toLowerCase());
  let url = `${BASE_URL}/avatar/${hash}?`;
  if (options.defaultImage) {
    url += `d=${options.defaultImage}&`;
  }
  return url;
}
