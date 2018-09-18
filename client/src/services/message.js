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
import {refreshMessage} from '../actions/application';
import {updateFolder} from '../actions/folders';
import {abortControllerWrappers, abortFetch, credentialsHeaders, toJson} from './fetch';
import {processFolders} from './folder';
import {persistMessageCache} from './indexed-db';
import {KEY_HASH, KEY_USER_ID} from './state';

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
 */
export async function resetFolderMessagesCache(dispatch, credentials, folder) {
  if (folder && folder._links) {
    abortFetch(abortControllerWrappers.resetFolderMessagesCacheAbortController);
    abortControllerWrappers.resetFolderMessagesCacheAbortController = new AbortController();
    const signal = abortControllerWrappers.resetFolderMessagesCacheAbortController.signal;

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

export function updateFolderMessagesCache(dispatch, credentials, folder, start, end) {
  abortFetch(abortControllerWrappers.updateFolderMessagesCacheAbortController);
  abortControllerWrappers.updateFolderMessagesCacheAbortController = new AbortController();
  const signal = abortControllerWrappers.updateFolderMessagesCacheAbortController.signal;

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
    abortFetch(abortControllerWrappers.readMessageAbortController);
    abortControllerWrappers.readMessageAbortController = new AbortController();
    const signal = abortControllerWrappers.readMessageAbortController.signal;

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
        // Update folder with freshest information
        dispatch(updateFolder(processFolders([completeMessage.folder])[0]));
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
  // Abort any operations that can affect operation result
  abortFetch(abortControllerWrappers.resetFolderMessagesCacheAbortController);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  // Calculate new fromFolder values
  const fromFolderUpdated = {
    ...fromFolder,
    messageCount: fromFolder.messageCount - 1,
    unreadMessageCount: fromFolder.unreadMessageCount - (message.seen ? 0 : 1),
    newMessageCount: fromFolder.newMessageCount - (message.recent ? 1 : 0)
  };

  dispatch(deleteFromCache(fromFolder, [message]));
  dispatch(updateFolder(fromFolderUpdated));
  fetch(message._links.move.href.replace('{toFolderId}', toFolder.folderId), {
    method: 'PUT',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(newMessages => {
      if (Array.isArray(newMessages)) {
        dispatch(updateCache(toFolder, newMessages));
        newMessages.forEach(m => dispatch(updateFolder(processFolders([m.folder])[0])));
      }
    })
    .catch(() => {
      dispatch(updateCache(fromFolder, [message]));
      dispatch(updateFolder(fromFolder));
    });
}
