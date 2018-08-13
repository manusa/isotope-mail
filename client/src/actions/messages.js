import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.MESSAGES_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.MESSAGES_BE_REQUEST_COMPLETED});

export const loadFromCache = folder => ({type: ActionTypes.MESSAGES_LOAD_FROM_CACHE, payload: folder});

export const updateCache = (folder, messages) => ({
  type: ActionTypes.MESSAGES_UPDATE_CACHE,
  payload: {folder, messages}
});

/**
 * Dispatcher function to update store messages
 *
 * If a {@link backendRequest} was made in order to retrieve messages this flag should be set to true
 *
 * @param messages
 * @returns {{type: string, payload: *}}
 */
export const setMessages = messages => ({type: ActionTypes.MESSAGES_SET, payload: messages});
export const addMessage = message => ({type: ActionTypes.ADD_MESSAGE, payload: message});
