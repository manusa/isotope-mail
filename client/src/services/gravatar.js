import md5 from './md5';

const BASE_URL = 'https://www.gravatar.com';

export function imageUrl(email, options = {}) {
  const hash = md5(email.trim().toLowerCase());
  const url = new URL(`${BASE_URL}/avatar/${hash}`);
  if (options.defaultImage) {
    url.searchParams.append('d', options.defaultImage);
  }
  return url.toString();
}
