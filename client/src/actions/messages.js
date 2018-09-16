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

export const addMessage = message => ({type: ActionTypes.ADD_MESSAGE, payload: message});
