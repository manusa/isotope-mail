import {preDownloadMessages} from '../actions/application';
import {
  backendRequest,
  backendRequestCompleted,
  deleteFromCache,
  setFolderCache,
  setSelected,
  updateCache, updateCacheIfExist
} from '../actions/messages';
import {updateFolder} from '../actions/folders';
import {abortControllerWrappers, abortFetch, credentialsHeaders, toJson} from './fetch';
import {persistMessageCache} from './indexed-db';
import {notifyNewMail} from './notification';

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

/**
 * "Aborts" the event source (SSE received stream) to reset folder message cache.
 *
 * This will cancel current message poll.
 *
 * @param dispatch
 */
export function closeResetFolderMessagesCacheEventSource(dispatch) {
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
}

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 */
export async function resetFolderMessagesCache(dispatch, user, folder) {
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  if (folder && folder._links) {
    const allMessages = [];
    // Prefer EventSourcePolyfill instead of EventSource to allow sending HTTP headers in all browsers
    const es = new window.EventSourcePolyfill(folder._links.messages.href,
      {
        headers: credentialsHeaders(user.credentials)
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
          user.id, user.hash, folder, [...allMessages]);
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

export function preloadMessages(dispatch, credentials, folder, messageUids) {
  if (messageUids.length === 0) {
    return;
  }
  const url = new URL(folder._links.messages.href);
  messageUids.forEach(messageUid => url.searchParams.append('id', messageUid));
  fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(messages => {
      if (messages.some(m => m.recent === true)) {
        notifyNewMail();
      }
      dispatch(preDownloadMessages(messages));
    });
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

/**
 * Moves the provided array of messaged from the original fromFolder to the target toFolder.
 *
 * This method is optimistic and will calculate fromFolder message counts before any server response is received.
 *
 * @param dispatch {!function}
 * @param credentials {!Object}
 * @param fromFolder {!Object}
 * @param toFolder {!Object}
 * @param messages {!Array.<Object>}
 */
export function moveMessages(dispatch, credentials, fromFolder, toFolder, messages) {
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  const fromFolderUpdated = {
    ...fromFolder
  };
  messages.forEach(m => {
    dispatch(setSelected([m], false));
    // Calculate new fromFolder values
    fromFolderUpdated.messageCount -= 1;
    fromFolderUpdated.unreadMessageCount -= (m.seen ? 0 : 1);
    fromFolderUpdated.newMessageCount -= (m.recent ? 1 : 0);
  });

  // Update state with expected response from server
  dispatch(deleteFromCache(fromFolder, messages));
  dispatch(updateFolder(fromFolderUpdated));
  fetch(messages[0]._links['move.bulk'].href.replace('{toFolderId}', toFolder.folderId), {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(messages.map(m => m.uid))
  })
    .then(toJson)
    .then(newMessages => {
      if (Array.isArray(newMessages)) {
        dispatch(updateCache(toFolder, newMessages));
        // Update folder info with the last message (contains the most recent information)
        dispatch(updateFolder(newMessages[newMessages.length - 1].folder));
      }
    })
    .catch(() => {
      // Rollback state from dispatched expected responses
      dispatch(updateCache(fromFolder, messages));
      dispatch(updateFolder(fromFolder));
    });
}

export function setMessagesSeen(dispatch, credentials, folder, messages, seen) {
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  const messagesToUpdate = [];
  // Update state with expected response from server
  const expectedUpdatedFolder = {...folder};
  messages.forEach(m => {
    // Calculate new folder values
    if (m.seen !== seen) {
      messagesToUpdate.push({...m, seen: seen});
      expectedUpdatedFolder.unreadMessageCount += seen ? -1 : +1;
    }
  });
  dispatch(updateCache(folder, messagesToUpdate));
  dispatch(updateFolder(expectedUpdatedFolder));

  fetch(messages[0]._links['seen.bulk'].href.replace('{seen}', seen.toString()), {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(messagesToUpdate.map(m => m.uid))
  })
    .then(response => {
      if (!response.ok) {
        // Rollback state from dispatched expected responses
        dispatch(updateCacheIfExist(folder, messages));
        dispatch(updateFolder(folder));
      }
    });
}

export function deleteMessages(dispatch, credentials, folder, messages) {
  if (messages.length === 0) {
    return;
  }
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  const url = new URL(folder._links.messages.href);
  const messagesToDelete = [];
  messages.forEach(message => {
    url.searchParams.append('id', message.uid);
    messagesToDelete.push({...message, deleted: true});
  });
  dispatch(deleteFromCache(folder, messagesToDelete));
  dispatch(setSelected(messagesToDelete, false));
  fetch(url, {
    method: 'DELETE',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(updatedFolder => {
      dispatch(updateFolder(updatedFolder));
    })
    .catch(() => {
      // Rollback state from dispatched expected responses
      dispatch(updateCacheIfExist(folder, messages));
      dispatch(updateFolder(folder));
    });
}
