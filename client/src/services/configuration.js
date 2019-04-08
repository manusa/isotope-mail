import {URLS} from './url';
import {toJson} from './fetch';

export async function fetchConfiguration() {
  const response = await fetch(URLS.CONFIGURATION);
  if (response.ok) {
    return await toJson(response);
  }
  return null;
}
