import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.APPLICATION_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
export const setUserCredentials = (userId, hash, credentials) =>
  ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_SET, payload: {userId, hash, credentials}});
export const selectFolder = folder => ({type: ActionTypes.APPLICATION_FOLDER_SELECT, payload: folder});
export const renameFolder = folder => ({type: ActionTypes.APPLICATION_FOLDER_RENAME, payload: folder});
export const renameFolderOk = (oldFolderId, newFolderId) => ({
  type: ActionTypes.APPLICATION_FOLDER_RENAME_OK,
  payload: {oldFolderId, newFolderId}
});
export const selectMessage = message => ({type: ActionTypes.APPLICATION_MESSAGE_SELECT, payload: message});
/**
 * Refreshes the current selectedMessage if it's still the same (same selectedFolder and same selectedMessage)
 *
 * @param folder
 * @param message
 * @returns {{type: string, payload: {folder: *, message: *}}}
 */
export const refreshMessage = (folder, message) =>
  ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH, payload: {folder, message}});
export const refreshMessageBackendRequest = () => ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST});
export const refreshMessageBackendRequestCompleted = () =>
  ({type: ActionTypes.APPLICATION_MESSAGE_REFRESH_BE_REQUEST_COMPLETED});
export const preDownloadMessages = messages =>
  ({type: ActionTypes.APPLICATION_MESSAGE_PRE_DOWNLOAD, payload: {messages}});
export const replaceMessageEmbeddedImages = (folder, message, attachment, blob) =>
  ({type: ActionTypes.APPLICATION_MESSAGE_REPLACE_IMAGE, payload: {folder, message, attachment, blob}});
export const setError = (type, value) => ({type: ActionTypes.APPLICATION_ERROR_SET, payload: {type, value}});

export const editMessage = message => ({type: ActionTypes.APPLICATION_MESSAGE_EDIT, payload: message});

export const outboxSendMessage = message => ({type: ActionTypes.APPLICATION_OUTBOX_SEND, payload: message});
export const outboxUpdateProgress = progress =>
  ({type: ActionTypes.APPLICATION_OUTBOX_UPDATE_PROGRESS, payload: progress});
export const outboxSetSent = sent =>
  ({type: ActionTypes.APPLICATION_OUTBOX_SET_SENT, payload: sent});
export const outboxSetError = error =>
  ({type: ActionTypes.APPLICATION_OUTBOX_SET_ERROR, payload: error});
export const outboxMessageProcessed = () => ({type: ActionTypes.APPLICATION_OUTBOX_MESSAGE_PROCESSED});
