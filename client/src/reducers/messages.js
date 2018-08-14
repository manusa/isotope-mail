import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = initialState.messages, action) => {
  switch (action.type) {
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.MESSAGES_UPDATE_CACHE:
      const newState = {...state};
      newState.cache[action.payload.folder.folderId] =
        new Map(action.payload.messages.map(m => [m.uid, m]));
      return newState;
    case ActionTypes.ADD_MESSAGE:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
};

export default messages;
