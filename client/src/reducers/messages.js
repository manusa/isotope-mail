import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = initialState.messages, action) => {
  switch (action.type) {
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_SET:
      return {...state,
        items: [...action.payload.messages],
        activeRequests: state.activeRequests - (action.payload.fromBackend ? 1 : 0)
      };
    case ActionTypes.ADD_MESSAGE:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
};

export default messages;
