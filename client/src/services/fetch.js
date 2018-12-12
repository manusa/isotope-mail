export const HttpHeaders = {
  ISOTOPE_CREDENTIALS: 'X-Isotope-Credentials',
  ISOTOPE_SALT: 'X-Isotope-Salt',
  CONTENT_TYPE: 'Content-Type'
};

export const HttpStatusFamilies = {
  INFORMATIONAL: 1,
  SUCCESSFUL: 2,
  REDIRECTION: 3,
  CLIENT_ERROR: 4,
  SERVER_ERROR: 5
};

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
    throw Error(`${response.status}`);
  }
  return response.json();
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
