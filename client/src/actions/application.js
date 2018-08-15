import {ActionTypes} from './action-types';

export const setUserCredentials = credentials =>
  ({type: ActionTypes.APPLICATION_USER_CREDENTIALS_SET, payload: credentials});
