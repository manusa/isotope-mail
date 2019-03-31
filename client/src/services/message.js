import {
  backendRequest as applicationBackendRequest,
  backendRequestCompleted as applicationBackendRequestCompleted,
  preDownloadMessages
} from '../actions/application';
import {
  backendRequest,
  backendRequestCompleted,
  deleteFromCache, lockMessages, setFolderCache,
  setSelected, unlockMessages,
  updateCache, updateCacheIfExist
} from '../actions/messages';
import {updateFolder} from '../actions/folders';
import {abortControllerWrappers, abortFetch, AuthenticationException, credentialsHeaders, toJson} from './fetch';
import {persistMessageCache} from './indexed-db';
import {notifyNewMail} from './notification';
import {FolderTypes} from './folder';

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
 * @param user
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
    let isFirstBatch = true;
    es.onmessage = e => {
      const messages = JSON.parse(e.data);
      allMessages.push(...messages);

      // Remove UIDs not included in batch update from store
      const originalUids = messages.map(m => m.uid);
      let maxUid = null;
      let minUid = null;
      if (originalUids.length > 0) {
        maxUid = originalUids.reduce((a, b) => Math.max(a, b));
        minUid = originalUids.reduce((a, b) => Math.min(a, b));
        const completeUidSequence = Array(maxUid - minUid + 1).fill('').map((v, i) => i + minUid);
        const uidsToRemove = completeUidSequence.filter(uid => !originalUids.includes(uid));
        if (uidsToRemove.length > 0) {
          dispatch(deleteFromCache(folder, uidsToRemove.map(uid => ({uid}))));
        }
      }

      dispatch(updateCache(folder, messages));

      // This is the First Batch -> Delete all messages with a higher UID not included in the batch
      if (isFirstBatch) {
        isFirstBatch = false;
        if (maxUid) {
          dispatch(deleteFromCache(folder, [], {from: maxUid + 1}));
        } else {
          // Clear empty folder if first batch has no uids
          dispatch(deleteFromCache(folder, [], {from: 0}));
        }
      }

      // This is the last batch -> persistMessageCache with all new gathered messages
      if (e.lastEventId === '1') {
        _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
        // Remove uids not included in batch (0-minUidInBatch)
        if (minUid) {
          dispatch(deleteFromCache(folder, [], {to: minUid - 1}));
        }
        // Manually persist newest version of message cache
        persistMessageCache(user.id, user.hash, folder, [...allMessages]);
      }
    };
    // Return a promise
    return new Promise((resolve, reject) => {
      // Store resolve function that will be called in _closeEventSource
      es.resolvePromise = resolve;
      es.onerror = ({status, message}) => {
        if (status === 401) {
          reject(new AuthenticationException(message));
        }
      };
    });
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
      if (folder.type === FolderTypes.INBOX && messages.some(m => m.recent === true)) {
        notifyNewMail();
      }
      dispatch(preDownloadMessages(messages));
    })
    .catch(() => {/* Ignore any preload error */});
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
 * Moves the provided array of messages from the original fromFolder to the target toFolder.
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
  dispatch(lockMessages(messages));
  fetch(fromFolder._links['message.move.bulk'].href.replace('{toFolderId}', toFolder.folderId), {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(messages.map(m => m.uid))
  })
    .then(toJson)
    .then(newMessages => {
      dispatch(unlockMessages(messages));
      if (Array.isArray(newMessages)) {
        dispatch(updateCache(toFolder, newMessages));
        // Update folder info with the last message (contains the most recent information)
        dispatch(updateFolder(newMessages[newMessages.length - 1].folder));
      }
    })
    .catch(() => {
      dispatch(unlockMessages(messages));
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
  dispatch(updateCacheIfExist(folder, messagesToUpdate, true));
  dispatch(updateFolder(expectedUpdatedFolder));
  dispatch(lockMessages(messagesToUpdate));

  fetch(folder._links['message.seen.bulk'].href.replace('{seen}', seen.toString()), {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(messagesToUpdate.map(m => m.uid))
  })
    .then(response => {
      dispatch(unlockMessages(messagesToUpdate));
      if (!response.ok) {
        // Rollback state from dispatched expected responses
        dispatch(updateCacheIfExist(folder, messages));
        dispatch(updateFolder(folder));
      }
    });
}

export function setMessageFlagged(dispatch, credentials, folder, message, flagged) {
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  dispatch(updateCacheIfExist(folder, [{...message, flagged}], true));
  dispatch(lockMessages([message]));
  fetch(folder._links['message.flagged'].href.replace('{messageId}', message.uid), {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(flagged)
  })
    .then(response => {
      dispatch(unlockMessages([message]));
      if (!response.ok) {
        // Rollback state from dispatched expected responses
        dispatch(updateCacheIfExist(folder, [message]));
      }
    });
}

export async function deleteAllFolderMessages(dispatch, credentials, folder) {
  // Abort any operations that can affect operation result
  _closeEventSource(dispatch, _eventSourceWrappers.resetFolderMessagesCache);
  abortFetch(abortControllerWrappers.getFoldersAbortController);
  dispatch(applicationBackendRequest());
  try {
    const updatedFolder = await fetch(folder._links.messages.href, {
      method: 'DELETE',
      headers: credentialsHeaders(credentials)
    }).then(toJson);
    dispatch(updateFolder(updatedFolder));
    dispatch(setFolderCache(updatedFolder, []));
    dispatch(applicationBackendRequestCompleted());
  } catch (e) {
    dispatch(applicationBackendRequestCompleted());
  }
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
  // Update state with expected response from server
  const expectedUpdatedFolder = {...folder};
  messages.forEach(message => {
    url.searchParams.append('id', message.uid);
    messagesToDelete.push({...message, deleted: true});
    expectedUpdatedFolder.deletedMessageCount++;
    expectedUpdatedFolder.unreadMessageCount = message.seen ? expectedUpdatedFolder.unreadMessageCount
      : expectedUpdatedFolder.unreadMessageCount - 1;
    expectedUpdatedFolder.newMessageCount = message.recent ? expectedUpdatedFolder.newMessageCount - 1
      : expectedUpdatedFolder.newMessageCount;
  });
  dispatch(updateCacheIfExist(folder, messagesToDelete, true));
  dispatch(setSelected(messagesToDelete, false));
  dispatch(updateFolder(expectedUpdatedFolder));
  dispatch(lockMessages(messagesToDelete));

  fetch(url, {
    method: 'DELETE',
    headers: credentialsHeaders(credentials)
  })
    .then(toJson)
    .then(updatedFolder => {
      dispatch(unlockMessages(messagesToDelete));
      dispatch(updateFolder(updatedFolder));
      dispatch(deleteFromCache(updatedFolder, messagesToDelete));
    })
    .catch(() => {
      dispatch(unlockMessages(messagesToDelete));
      // Rollback state from dispatched expected responses
      dispatch(updateCacheIfExist(folder, messages));
      dispatch(updateFolder(folder));
    });
}
