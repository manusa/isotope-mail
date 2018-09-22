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

const _eventSourceWrappers = {};

function _closeEventSource(dispatch, es) {
  if (es && es.close) {
    es.close();
    if (!es.DISPATCHED) {
      dispatch(backendRequestCompleted());
      es.DISPATCHED = true;
      es.resolvePromise();
    }
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
 */
export async function resetFolderMessagesCache(dispatch, credentials, folder) {
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  if (folder && folder._links) {
    const allMessages = [];
    // Prefer EventSourcePolyfill instead of EventSource to allow sending HTTP headers in all browsers
    const es = new window.EventSourcePolyfill(folder._links.messages.href,
      {
        headers: credentialsHeaders(credentials)
      });
    _eventSourceWrappers.resetFolderMessagesCache = es;
    dispatch(backendRequest());
    es.onmessage = e => {
      const messages = JSON.parse(e.data);
      allMessages.push(...messages);
      if (e.lastEventId === '1') {
        // This is the last batch
        dispatch(setFolderCache(folder, allMessages));
        _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
        // Manually persist newest version of message cache
        persistMessageCache(
          sessionStorage.getItem(KEY_USER_ID), sessionStorage.getItem(KEY_HASH), folder, [...allMessages]);
      } else {
        dispatch(updateCache(folder, messages));
      }
    };
    // Return a promise
    const eventSourceCompleted = new Promise(resolve => {
      // Store resolve function that will be called in _closeEventSource
      es.resolvePromise = resolve;
    });
    return eventSourceCompleted;
  }
  return null;
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
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  // Calculate new fromFolder values
  const fromFolderUpdated = {
    ...fromFolder,
    messageCount: fromFolder.messageCount - 1,
    unreadMessageCount: fromFolder.unreadMessageCount - (message.seen ? 0 : 1),
    newMessageCount: fromFolder.newMessageCount - (message.recent ? 1 : 0)
  };

  // Update state with expected response from server
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
      // Rollback state from dispatched expected responses
      dispatch(updateCache(fromFolder, [message]));
      dispatch(updateFolder(fromFolder));
    });
}

export function setMessageSeen(dispatch, credentials, folder, message, seen) {
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  // Update state with expected response from server
  const expectedUpdatedMessage = {...message, seen: seen};
  dispatch(updateCache(folder, [expectedUpdatedMessage]));
  const expectedUpdatedFolder = {...folder, unreadMessageCount: folder.unreadMessageCount + 1};
  dispatch(updateFolder(expectedUpdatedFolder));

  fetch(message._links.seen.href, {
    method: 'PUT',
    headers: credentialsHeaders(credentials, { 'Content-Type': 'application/json'}),
    body: JSON.stringify(seen)
  })
    .then(toJson)
    .then(updatedMessage => {
      dispatch(updateCache(folder, [updatedMessage]));
      dispatch(updateFolder(processFolders([updatedMessage.folder])[0]));
    })
    .catch(() => {
      // Rollback state from dispatched expected responses
      dispatch(updateCache(folder, [message]));
      dispatch(updateFolder(folder));
    });
}
