import {
  refreshMessageBackendRequest,
  refreshMessageBackendRequestCompleted,
  replaceMessageEmbeddedImages
} from '../actions/application';
import {updateCacheIfExist} from '../actions/messages';
import {updateFolder, updateFolderProperties} from '../actions/folders';
import {refreshMessage} from '../actions/application';
import {getIsotopeConfiguration} from '../selectors/globals';
import {abortControllerWrappers, abortFetch, credentialsHeaders, toJson} from './fetch';
import {closeResetFolderMessagesCacheEventSource} from './message';

/**
 * Performs a BE request to read an embedded attachment (image) and replaces the e-mail content
 * with the image once it's received.
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param message
 * @param signal
 * @param attachment
 * @private
 */
function _readEmbeddedContent(dispatch, credentials, folder, message, signal, attachment) {
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
 * Returns a function that will perform a BE request to read a message.
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param message
 * @returns {function(): Promise<Response>}
 * @private
 */
function _readMessageRequest(dispatch, credentials, folder, message) {
  // Abort + new signal
  abortFetch(abortControllerWrappers.readMessageAbortController);
  abortControllerWrappers.readMessageAbortController = new AbortController();
  const signal = abortControllerWrappers.readMessageAbortController.signal;

  return () => {
    dispatch(refreshMessageBackendRequest());
    const url = getIsotopeConfiguration()._links['folders.message'].href
      .replace('{folderId}', folder.folderId)
      .replace('{messageId}', message.uid);
    return fetch(url, {
      method: 'GET',
      headers: credentialsHeaders(credentials),
      signal: signal
    })
      .then(response => {
        dispatch(refreshMessageBackendRequestCompleted());
        return response;
      })
      .then(toJson)
      .catch(() => {
        dispatch(refreshMessageBackendRequestCompleted());
        throw Error();
      });
  };
}

/**
 * Performs a request to the BE to mark a message as seen
 * @param credentials
 * @param folder
 * @param message
 * @returns {Promise<Response>}
 * @private
 */
function _messageSeenRequest(credentials, folder, message) {
  const url = getIsotopeConfiguration()._links['folders.message.seen'].href
    .replace('{folderId}', folder.folderId)
    .replace('{messageId}', message.uid);
  return fetch(url, {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: JSON.stringify(true)
  });
}

/**
 * Reads the content of a message.
 *
 * If the message is cached in the application.downloadedMessages map, the content is loaded from the cache
 * and will be completed with a BE request to fetch the missing parts (attachments...).
 *
 * If the message is not cached, a backend request will be performed to read the complete message.
 *
 * In both cases, any missing embedded image in tha attachment list will be fetched. For cached messages, unless action
 * was previously aborted, the embedded images will have already been loaded.
 *
 * BE read message request won't set the message as seen. If the BE request completes successfully, and additional
 * request to the server will be sent to confirm this and set the message as seen.
 *
 * @param dispatch
 * @param credentials
 * @param downloadedMessages
 * @param folder
 * @param message {object}
 */
export function readMessage(dispatch, credentials, downloadedMessages, folder, message) {
  // Abort any operations that can affect operation result data consistency
  closeResetFolderMessagesCacheEventSource(dispatch);
  abortFetch(abortControllerWrappers.getFoldersAbortController);

  const fetchMessage = _readMessageRequest(dispatch, credentials, folder, message);
  const signal = abortControllerWrappers.readMessageAbortController.signal;

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
    // Update folder message cache to set message as seen ASAP
    dispatch(updateCacheIfExist(folder, [updatedMessage]));
    // Update folder seen counter if applicable
    if (!message.seen) {
      dispatch(updateFolderProperties({...folder, unreadMessageCount: folder.unreadMessageCount - 1}));
      // Send request to BE to mark message as read
      _messageSeenRequest(credentials, folder, message);
    }
    // Read message from BE to update links (attachments) and other mutable properties
    $message = fetchMessage()
      .then(completeMessage => (
        Promise.resolve({...completeMessage, content: updatedMessage.content})
      ));
  } else {
    // Read message from BE (Set message seen only if request is successful)
    $message = fetchMessage()
    // Message successfully loaded, send signal to BE to mark as read if applicable and change folder information
      .then(completeMessage => {
        if (!completeMessage.seen) {
          _messageSeenRequest(credentials, completeMessage.folder, completeMessage);
          completeMessage.folder.unreadMessageCount--;
        }
        return Promise.resolve(completeMessage);
      });
  }
  $message
    .then(completeMessage => {
      // Optimistically set message as seen
      completeMessage.seen = true;
      // Update folder with freshest BE information (and optimistic unreadMessageCount)
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
        .forEach(a => _readEmbeddedContent(dispatch, credentials, folder, message, signal, a));
    }).catch(() => {});
}
