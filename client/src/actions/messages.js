import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.MESSAGES_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});

export const setCache = cache => ({
  type: ActionTypes.MESSAGES_SET_CACHE,
  payload: cache
});

export const setFolderCache = (folder, messages) => ({
  type: ActionTypes.MESSAGES_SET_FOLDER_CACHE,
  payload: {folder, messages}
});

/**
 * Updates state folder's messages cache.
 *
 * @param folder to which the messages will be added
 * @param messages {Array} array of messages to add to the folder's cache
 * @returns {{type: string, payload: {folder: *, messages: *}}}
 */
export const updateCache = (folder, messages) => ({
  type: ActionTypes.MESSAGES_UPDATE_CACHE,
  payload: {folder, messages}
});

/**
 * Updates state folder's messages cache only if the messages already exist in the folder cache.
 *
 * @param folder to which the messages will be added
 * @param messages {Array} array of messages to add to the folder's cache
 * @param {boolean} ignoreLocked
 * @returns {{type: string, payload: {folder: *, messages: *}}}
 */
export const updateCacheIfExist = (folder, messages, ignoreLocked = false) => ({
  type: ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST,
  payload: {folder, messages, ignoreLocked}
});

/**
 * Delete messages from state folder's messages cache.
 *
 * @param {!object} folder from which the messages will be deleted
 * @param {!Array} messages array of messages to delete from the folder's cache
 * @param {object} [deleteUidRange] Range of message UIDs to keep (inclusive)
 * @param {number} [deleteUidRange.from] delete all messages starting with this UID
 * @param {number} [deleteUidRange.to] delete all messages until this UID
 * @returns {{type: string, payload: {folder: *, messages: *}}}
 */
export const deleteFromCache = (folder, messages, deleteUidRange) => ({
  type: ActionTypes.MESSAGES_DELETE_FROM_CACHE,
  payload: {folder, messages, deleteUidRange}
});

export const renameCache = (oldId, newId) => ({
  type: ActionTypes.MESSAGES_RENAME_CACHE,
  payload: {oldId, newId}
});

/**
 * Adds the provided message uid to the selected message list if selected or else removes it from the list
 *
 * @param message {Object}
 * @param selected {boolean}
 * @returns {{type: string, payload: {message: *, selected: *}}}
 */
export const setSelected = (messages, selected) => ({
  type: ActionTypes.MESSAGES_SET_SELECTED,
  payload: {messages, selected}
});

/**
 * Clears the list of selected message uids
 *
 * @returns {{type: string}}
 */
export const clearSelected = () => ({
  type: ActionTypes.MESSAGES_CLEAR_SELECTED
});

/**
 * Adds the messageId(s) of the provided messages to the messages.locked array in the Redux store.
 *
 * @param {Array.<{messageId: string}>} messages
 * @returns {{type: string, payload: *}}
 */
export const lockMessages = messages => ({
  type: ActionTypes.MESSAGES_LOCK_ADD, payload: messages
});

/**
 * Removes the messageId(s) of the provided messages from the messages.locked array in the Redux store.
 *
 * @param {Array.<{messageId: string}>} messages
 * @returns {{type: string, payload: *}}
 */
export const unlockMessages = messages => ({
  type: ActionTypes.MESSAGES_LOCK_REMOVE, payload: messages
});
