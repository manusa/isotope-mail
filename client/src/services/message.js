import {
  backendRequest as aBackendRequest,
  backendRequestCompleted as aBackendRequestCompleted, replaceMessageEmbeddedImages
} from '../actions/application';
import {
  backendRequest,
  backendRequestCompleted,
  deleteFromCache,
  setFolderCache,
  updateCache
} from '../actions/messages';
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

/**
 * Triggers the abort method of a the specified AbortController
 *
 * @param abortController {AbortController}
 * @private
 */
function _abortFetch(abortController) {
  if (abortController && abortController.abort) {
    abortController.abort();
  }
}

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
export async function resetFolderMessagesCache(dispatch, credentials, folder) {
  if (folder && folder._links) {
    _abortFetch(_abortControllerWrappers.resetFolderMessagesCacheAbortController);
    _abortControllerWrappers.resetFolderMessagesCacheAbortController = new AbortController();
    const signal = _abortControllerWrappers.resetFolderMessagesCacheAbortController.signal;

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
    _abortFetch(_abortControllerWrappers.readMessageAbortController);
    _abortControllerWrappers.readMessageAbortController = new AbortController();
    const signal = _abortControllerWrappers.readMessageAbortController.signal;

    dispatch(aBackendRequest());
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

export function downloadAttachment(credentials, attachment) {
  const fetch$ = fetch(attachment._links.download.href, {
    method: 'GET',
    headers: credentialsHeaders(credentials)
  }).then(response => response.blob());
  fetch$
    .then(blob => {
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, attachment.fileName);
      } else {
        const url = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.download = attachment.fileName;
        document.body.appendChild(tempLink);
        // tempLink.click();
        tempLink.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(url);
      }
    });
  return fetch$;
}

export function moveMessage(dispatch, credentials, fromFolder, toFolder, message) {
  _abortFetch(_abortControllerWrappers.resetFolderMessagesCacheAbortController);
  dispatch(deleteFromCache(fromFolder, [message]));
  fetch(message._links.move.href.replace('{toFolderId}', toFolder.folderId), {
    method: 'PUT',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(newMessages => {
      if (Array.isArray(newMessages)) {
        dispatch(updateCache(toFolder, newMessages));
      }
    })
    .catch(() => {
      dispatch(updateCache(fromFolder, [message]));
    });
}
