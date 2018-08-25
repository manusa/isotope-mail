import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.APPLICATION_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
export const setUserCredentials = (userId, hash, credentials) =>
  ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_SET, payload: {userId, hash, credentials}});
export const selectFolder = folder => ({type: ActionTypes.APPLICATION_FOLDER_SELECT, payload: folder});
export const setError = (type, value) => ({type: ActionTypes.APPLICATION_ERROR_SET, payload: {type, value}});
