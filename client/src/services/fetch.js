export const HttpHeaders = {
  ISOTOPE_CREDENTIALS: 'X-Isotope-Credentials',
  ISOTOPE_SALT: 'X-Isotope-Salt'
};

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
