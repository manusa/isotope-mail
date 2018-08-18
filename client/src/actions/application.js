import {ActionTypes} from './action-types';

export const backendRequest = () => ({type: ActionTypes.APPLICATION_BE_REQUEST});
export const backendRequestCompleted = () => ({type: ActionTypes.APPLICATION_BE_REQUEST_COMPLETED});
export const setUserCredentials = credentials =>
  ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_SET, payload: credentials});
