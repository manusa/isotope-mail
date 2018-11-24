import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = INITIAL_STATE.messages, action = {}) => {
  switch (action.type) {
    case ActionTypes.APPLICATION_FOLDER_RENAME_OK: {
      const newState = {...state};
      newState.cache[action.payload.newFolderId] = newState.cache[action.payload.oldFolderId];
      delete newState.cache[action.payload.oldFolderId];
      return newState;
    }
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.MESSAGES_SET_CACHE:
      return {...state, cache: action.payload};
    case ActionTypes.MESSAGES_SET_FOLDER_CACHE: {
      const newState = {...state};
      newState.cache[action.payload.folder.folderId] =
        new Map(action.payload.messages.map(m => [m.uid, m]));
      return newState;
    }
    case ActionTypes.MESSAGES_UPDATE_CACHE: {
      const newUpdateState = {...state};
      if (newUpdateState.cache[action.payload.folder.folderId] instanceof Map === false) {
        newUpdateState.cache[action.payload.folder.folderId] = new Map();
      }
      action.payload.messages.forEach(m => newUpdateState.cache[action.payload.folder.folderId].set(m.uid, m));
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST: {
      const newUpdateState = {...state};
      const cache = newUpdateState.cache[action.payload.folder.folderId];
      if (cache instanceof Map === true) {
        action.payload.messages.forEach(m => {
          if (cache.has(m.uid)) {
            cache.set(m.uid, m);
          }
        });
      }
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_DELETE_FROM_CACHE: {
      const newUpdateState = {...state};
      if (newUpdateState.cache[action.payload.folder.folderId] instanceof Map === false) {
        return state;
      }
      action.payload.messages.forEach(m => newUpdateState.cache[action.payload.folder.folderId].delete(m.uid));
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_SET_SELECTED: {
      const newUpdateState = {...state};
      newUpdateState.selected = [...state.selected];
      action.payload.messages.forEach(message => {
        const indexOfMessage = newUpdateState.selected.indexOf(message.uid);
        if (action.payload.selected && indexOfMessage < 0) {
          // Select Message
          newUpdateState.selected.push(message.uid);
        } else if (!action.payload.selected) {
          // Unselect message
          newUpdateState.selected = newUpdateState.selected.filter(uid => uid !== message.uid);
        }
      });
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_CLEAR_SELECTED: {
      const newUpdateState = {...state, selected: []};
      return newUpdateState;
    }
    default:
      return state;
  }
};

export default messages;
