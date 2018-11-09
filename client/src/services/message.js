import {
  backendRequest as aBackendRequest,
  backendRequestCompleted as aBackendRequestCompleted, replaceMessageEmbeddedImages
} from '../actions/application';
import {
  backendRequest,
  backendRequestCompleted,
  deleteFromCache,
  setFolderCache,
  setSelected,
  updateCache, updateCacheIfExist
} from '../actions/messages';
import {refreshMessage} from '../actions/application';
import {updateFolder} from '../actions/folders';
import {abortControllerWrappers, abortFetch, credentialsHeaders, toJson} from './fetch';
import {persistMessageCache} from './indexed-db';

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

/**
 * Reads the content of a message.
 *
 * If the message is cached in the application.downloadedMessages map, the content won't be fetched from the backend.
 *
 * If the message is not cached, a backend request will be peformed to read the complete message.
 *
 * In both cases, any missing embedded image in tha attachment list will be fetched. For cached messages, unless action
 * was previously aborted, the embedded images will have already been loaded.
 *
 * @param dispatch
 * @param credentials
 * @param downloadedMessages
 * @param folder
 * @param message {object}
 */
export function readMessage(dispatch, credentials, downloadedMessages, folder, message) {
  // Abort + new signal
  abortFetch(abortControllerWrappers.readMessageAbortController);
  abortControllerWrappers.readMessageAbortController = new AbortController();
  const signal = abortControllerWrappers.readMessageAbortController.signal;

  const fetchMessage = () => {
    dispatch(aBackendRequest());
    return fetch(message._links.self.href, {
      method: 'GET',
      headers: credentialsHeaders(credentials),
      signal: signal
    })
      .then(response => {
        dispatch(aBackendRequestCompleted());
        return response;
      })
      .then(toJson)
      .catch(() => dispatch(aBackendRequestCompleted()));
  };

  if (message && message._links) {
    const downloadedMessage = downloadedMessages[message.messageId];
    let $message;
    if (downloadedMessage) {
      // Read message from application.downloadedMessages cache
      // //////////////////////////////////////////////////////
      // Update cached/downloaded message (keep content), message may have been moved/read/...
      let updatedMessage = {...message, folder: {...folder}, seen: true};
      Object.entries(updatedMessage)
        .filter(entry => entry[1] === null // Remove empty arrays/strings...
          || entry[1].length === 0) // Remove null attributes
        .forEach(([key]) => delete updatedMessage[key]);
      updatedMessage = Object.assign({...downloadedMessage}, updatedMessage);
      // Show optimistic version of updated downloadedMessage
      dispatch(refreshMessage(folder, updatedMessage));
      // Read message from BE to update links (attachments) and other mutable properties
      $message = fetchMessage()
        .then(completeMessage => (
          Promise.resolve({...completeMessage, content: updatedMessage.content})
        ));
    } else {
      // Read message from BE
      $message = fetchMessage();
    }
    $message
      .then(completeMessage => {
        // Update folder with freshest BE information
        dispatch(updateFolder(completeMessage.folder));
        // Update folder cache with message marked as read (don't store content in cache)
        const messageWithNoContent = {...completeMessage};
        delete messageWithNoContent.content;
        dispatch(updateCacheIfExist(folder, [messageWithNoContent]));
        // Refresh message view
        dispatch(refreshMessage(folder, completeMessage));
        // Read message's embedded images if used in message content
        completeMessage.attachments
          .filter(a => a.contentId && a.contentId.length > 0)
          .filter(a => a.contentType.toLowerCase().indexOf('image/') === 0)
          .filter(a => {
            const contentId = a.contentId.replace(/[<>]/g, '');
            return completeMessage.content.indexOf(`cid:${contentId}`) >= 0;
          })
          .forEach(a => _readContent(dispatch, credentials, folder, message, signal, a));
      });
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
    .then(toJson)
    .then(() => {
      // Message and folder information was inferred previously, don't dispatch any actions as this information
      // can be updated
    })
    .catch(() => {
      // Rollback state from dispatched expected responses
      dispatch(updateCacheIfExist(folder, messages));
      dispatch(updateFolder(folder));
    });
}
