import {
  backendRequest as aBackendRequest,
  backendRequestCompleted as aBackendRequestCompleted, replaceMessageEmbeddedImages
} from '../actions/application';
import {backendRequest, backendRequestCompleted, setFolderCache, updateCache} from '../actions/messages';
import {credentialsHeaders, toJson} from './fetch';
import {persistMessageCache} from './indexed-db';
import {refreshMessage} from '../actions/application';
import {KEY_HASH, KEY_USER_ID} from './state';

/**
 * Object to store the different AbortController that will be used in the service methods to fetch from the API backend.
 *
 * @type {Object}
 * @private
 */
const _abortControllerWrappers = {};

function _readContent(dispatch, credentials, folder, message, signal, attachment) {
  fetch(attachment._links.download.href, {
    method: 'GET',
    headers: credentialsHeaders(credentials),
    signal: signal
  })
    .then(response => response.blob())
    .then(blob => {
      dispatch(replaceMessageEmbeddedImages(folder, message, attachment, blob));
    });
}

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param signal {AbortSignal}
 */
export async function resetFolderMessagesCache(dispatch, credentials, folder, signal) {
  if (folder && folder._links) {
    dispatch(backendRequest());
    return fetch(folder._links.messages.href, {
      method: 'GET',
      headers: credentialsHeaders(credentials),
      signal: signal
    })
      .then(response => {
        dispatch(backendRequestCompleted());
        return response;
      })
      .then(toJson)
      .then(json => {
        dispatch(setFolderCache(folder, json));
        // Manually persist newest version of message cache
        persistMessageCache(sessionStorage.getItem(KEY_USER_ID), sessionStorage.getItem(KEY_HASH), folder, json);
      })
      .catch(() => dispatch(backendRequestCompleted()));
  }
  return null;
}

export function updateFolderMessagesCache(dispatch, credentials, folder, signal, start, end) {
  const url = new URL(folder._links.messages.href);
  if (start >= 0 && end >= 0) {
    url.search = new URLSearchParams({start, end}).toString();
  }
  dispatch(backendRequest());
  fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials),
    signal: signal
  })
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(toJson)
    .then(json => {
      dispatch(updateCache(folder, json));
    })
    .catch(() => dispatch(backendRequestCompleted()));
}

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param message {object}
 */
export function readMessage(dispatch, credentials, folder, message) {
  // Abort + signal
  if (message && message._links) {
    if (_abortControllerWrappers.readMessageAbortController) {
      _abortControllerWrappers.readMessageAbortController.abort();
    }
    _abortControllerWrappers.readMessageAbortController = new AbortController();
    const signal = _abortControllerWrappers.readMessageAbortController.signal;

    dispatch(aBackendRequest())
    fetch(message._links.self.href, {
      method: 'GET',
      headers: credentialsHeaders(credentials),
      signal: signal
    })
      .then(response => {
        dispatch(aBackendRequestCompleted());
        return response;
      })
      .then(toJson)
      .then(completeMessage => {
        dispatch(refreshMessage(folder, completeMessage));
        // Update folder cache with message marked as read (don't store content in cache)
        const messageWithNoContent = {...completeMessage};
        delete messageWithNoContent.content;
        dispatch(updateCache(folder, [messageWithNoContent]));
        // Read message's embedded images
        completeMessage.attachments
          .filter(a => a.contentId && a.contentId.length > 0)
          .filter(a => a.contentType.toLowerCase().indexOf('image/') === 0)
          .forEach(a => _readContent(dispatch, credentials, folder, message, signal, a));
      }).catch(() => dispatch(aBackendRequestCompleted()));
  }
}

