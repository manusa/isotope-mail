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
 * Delete messages from state folder's messages cache.
 *
 * @param folder from which the messages will be deleted
 * @param messages {Array} array of messages to delete from the folder's cache
 * @returns {{type: string, payload: {folder: *, messages: *}}}
 */
export const deleteFromCache = (folder, messages) => ({
  type: ActionTypes.MESSAGES_DELETE_FROM_CACHE,
  payload: {folder, messages}
});

/**
 * Adds the provided message uid to the selected message list if selected or else removes it from the list
 *
 * @param message {Object}
 * @param selected {boolean}
 * @returns {{type: string, payload: {message: *, selected: *}}}
 */
export const setSelected = (message, selected) => ({
  type: ActionTypes.MESSAGES_SET_SELECTED,
  payload: {message, selected}
});

/**
 * Clears the list of selected message uids
 *
 * @returns {{type: string}}
 */
export const clearSelected = () => ({
  type: ActionTypes.MESSAGES_CLEAR_SELECTED
});
