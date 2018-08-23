import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = INITIAL_STATE.messages, action) => {
  switch (action.type) {
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.MESSAGES_SET_CACHE:
      return {...state, cache: action.payload};
    case ActionTypes.MESSAGES_SET_FOLDER_CACHE:
      const newState = {...state};
      newState.cache[action.payload.folder.folderId] =
        new Map(action.payload.messages.map(m => [m.uid, m]));
      return newState;
    case ActionTypes.MESSAGES_UPDATE_CACHE:
      const newUpdateState = {...state};
      if (newUpdateState.cache[action.payload.folder.folderId] instanceof Map === false) {
        newUpdateState.cache[action.payload.folder.folderId] = new Map();
      }
      action.payload.messages.forEach(m => newUpdateState.cache[action.payload.folder.folderId].set(m.uid, m));
      return newUpdateState;
    case ActionTypes.ADD_MESSAGE:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
};

export default messages;
