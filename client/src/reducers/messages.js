import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = initialState.messages, action) => {
  switch (action.type) {
    case ActionTypes.ADD_MESSAGE:
      return [...state, action.payload];
    default:
      return state;
  }
}

export default messages;
