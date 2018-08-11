import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.MESSAGES_BE_REQUEST});
export const backendRequestFinished = () => ({type: ActionTypes.MESSAGES_BE_REQUEST_FINISHED});

/**
 * Dispatcher function to update store messages
 *
 * If a {@link backendRequest} was made in order to retrieve messages this flag should be set to true
 *
 * @param messages
 * @param fromBackend A backend request was made prior to dispatching this function
 * @returns {{type: string, payload: {messages: *, fromBackend: *}}}
 */
export const setMessages = (messages, fromBackend) => ({
  type: ActionTypes.MESSAGES_SET,
  payload: {
    messages,
    fromBackend
  }
});
export const addMessage = message => ({type: ActionTypes.ADD_MESSAGE, payload: message});
