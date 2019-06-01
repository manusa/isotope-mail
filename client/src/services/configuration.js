import {URLS} from './url';
import {toJson} from './fetch';

/**
 * @module services/configuration
 */
/**
 * @typedef {Object} Configuration
 * @property {Array} _links - HATEOAS links for application
 */

const TABLET_BREAKPOINT_PX = 600;

/**
 * Fetches configuration from BE
 * @returns {Promise<Configuration>}
 */
export async function fetchConfiguration() {
  const response = await fetch(URLS.CONFIGURATION);
  if (response.ok) {
    return await toJson(response);
  }
  return null;
}

/**
 * Checks if the current viewport is desktop sized
 *
 * @returns {boolean} true if current window size is a valid 'desktop' size, false otherwise
 */
export function isDesktop() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth) > TABLET_BREAKPOINT_PX;
}
