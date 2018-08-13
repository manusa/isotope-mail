import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = initialState.messages, action) => {
  switch (action.type) {
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests - 1};
    case ActionTypes.MESSAGES_SET:
      return {...state,
        items: [...action.payload]
      };
    case ActionTypes.MESSAGES_LOAD_FROM_CACHE:
      let visibleItems = [];
      if (state.cache[action.payload.folderId]) {
        visibleItems = Array.from(state.cache[action.payload.folderId].values());
      }
      return {...state, items: visibleItems};
    case ActionTypes.MESSAGES_UPDATE_CACHE:
      const newState = {...state};
      const folderId = action.payload.folder.folderId ? action.payload.folder.folderId : action.payload.folder;
      newState.cache[folderId] = new Map(action.payload.messages.map(m => [m.uid, m]));
      return newState;
    case ActionTypes.ADD_MESSAGE:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
};

export default messages;
