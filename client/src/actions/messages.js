import {ActionTypes} from './action-types';

export const addMessage = message => ({type: ActionTypes.ADD_MESSAGE, payload: message});
