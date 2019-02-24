import {refreshUserCredentials} from '../actions/application';

export const HttpHeaders = {
  ISOTOPE_CREDENTIALS: 'Isotope-Credentials',
  ISOTOPE_SALT: 'Isotope-Salt',
  CONTENT_TYPE: 'Content-Type'
};

export const HttpStatusFamilies = {
  INFORMATIONAL: 1,
  SUCCESSFUL: 2,
  REDIRECTION: 3,
  CLIENT_ERROR: 4,
  SERVER_ERROR: 5
};

export class AuthenticationException extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = 'AuthenticationException';
  }
}

/**
 * Object to store the different AbortController(s) that will be used in the service methods to fetch from the API backend.
 *
 * @type {Object}
 * @private
 */
export const abortControllerWrappers = {};

/**
 * Converts response Promise to json Promise or throws an error.
 *
 * @param {Response}response
 * @returns {PromiseLike<object>}
 */
export function toJson(response) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationException(response.statusText);
    } else {
      throw Error(`${response.status}`);
    }
  }
  return response.json();
}

/**
 * Dispatches the refreshUserCredentials action with the values obtained from the Http Response headers.
 *
 * @param dispatch
 * @param response
 * @returns {*}
 */
export function refreshCredentials(dispatch, response) {
  const credentials = response.headers.get(HttpHeaders.ISOTOPE_CREDENTIALS);
  const salt = response.headers.get(HttpHeaders.ISOTOPE_SALT);
  if (credentials && salt) {
    dispatch(refreshUserCredentials(credentials, salt));
  }
  return Promise.resolve(response);
}

/**
 * Triggers the abort method of a the specified AbortController
 *
 * @param abortController {AbortController}
 */
export function abortFetch(abortController) {
  if (abortController && abortController.abort) {
    abortController.abort();
  }
}

/**
 * Creates a new headers object including Isotope specific credentials headers for server authentication.
 *
 * @param {{}} credentials
 * @param {{}} [originalHeaders={}] originalHeaders
 * @returns {{}}
 */
export function credentialsHeaders(credentials, originalHeaders) {
  const newHeaders = Object.assign({}, originalHeaders ? originalHeaders : {});
  newHeaders[HttpHeaders.ISOTOPE_CREDENTIALS] = credentials.encrypted;
  newHeaders[HttpHeaders.ISOTOPE_SALT] = credentials.salt;
  return newHeaders;
}

/**
 * Returns true if the response the Successful HTTP status code range (2xx)
 *
 * @param HTTP status code of the response
 * @returns {boolean} true if status code belongs to HttpStatusFamilies.SUCCESSFUL family
 */
export function isSuccessful(status) {
  return Math.floor(status / 100) === HttpStatusFamilies.SUCCESSFUL;
}

