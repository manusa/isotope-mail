import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';

const messages = (state = INITIAL_STATE.messages, action = {}) => {
  switch (action.type) {
    case ActionTypes.MESSAGES_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.MESSAGES_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.MESSAGES_SET_CACHE:
      return {...state, cache: action.payload};
    case ActionTypes.MESSAGES_SET_FOLDER_CACHE: {
      const newState = {...state};
      newState.cache = {...newState.cache};
      newState.cache[action.payload.folder.folderId] = new Map(action.payload.messages.map(m => [m.uid, m]));
      return newState;
    }
    case ActionTypes.MESSAGES_UPDATE_CACHE: {
      const newUpdateState = {...state};
      newUpdateState.cache = {...newUpdateState.cache};
      if (newUpdateState.cache[action.payload.folder.folderId] instanceof Map === false) {
        newUpdateState.cache[action.payload.folder.folderId] = new Map();
      } else {
        newUpdateState.cache[action.payload.folder.folderId] =
          new Map(newUpdateState.cache[action.payload.folder.folderId]);
      }
      action.payload.messages
        .filter(m => !m.messageId || !newUpdateState.locked.includes(m.messageId))
        .forEach(m => newUpdateState.cache[action.payload.folder.folderId].set(m.uid, m));
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST: {
      const newUpdateState = {...state};
      newUpdateState.cache = {...newUpdateState.cache};
      if (newUpdateState.cache[action.payload.folder.folderId] instanceof Map === true) {
        newUpdateState.cache[action.payload.folder.folderId] =
          new Map(newUpdateState.cache[action.payload.folder.folderId]);
        const cache = newUpdateState.cache[action.payload.folder.folderId];
        let messagesToUpdate;
        if (action.payload.ignoreLocked) {
          messagesToUpdate = action.payload.messages;
        } else {
          messagesToUpdate = action.payload.messages
            .filter(m => !m.messageId || !newUpdateState.locked.includes(m.messageId));
        }
        messagesToUpdate.forEach(m => {
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

      newUpdateState.cache = {...newUpdateState.cache};
      newUpdateState.cache[action.payload.folder.folderId] =
        new Map(newUpdateState.cache[action.payload.folder.folderId]);
      // Delete unitary messages
      const cache = newUpdateState.cache[action.payload.folder.folderId];
      action.payload.messages.forEach(m => cache.delete(m.uid));

      // Delete UID range
      const {deleteUidRange} = action.payload;
      if (deleteUidRange) {
        let toDeleteUids = Array.from(cache.keys());
        if (deleteUidRange.from || deleteUidRange.from === 0) {
          toDeleteUids = toDeleteUids.filter(uid => uid >= deleteUidRange.from);
        }
        if (deleteUidRange.to || deleteUidRange.to === 0) {
          toDeleteUids = toDeleteUids.filter(uid => uid <= deleteUidRange.to);
        }
        toDeleteUids.forEach(uid => cache.delete(uid));
      }
      return newUpdateState;
    }
    case ActionTypes.MESSAGES_RENAME_CACHE: {
      const newState = {...state};
      if (newState.cache[action.payload.oldId]) {
        newState.cache = {...newState.cache};
        newState.cache[action.payload.newId] = newState.cache[action.payload.oldId];
        delete newState.cache[action.payload.oldId];
      }
      return newState;
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
    case ActionTypes.MESSAGES_LOCK_ADD: {
      const newState = {...state};
      newState.locked = [
        ...newState.locked,
        ...action.payload
          .filter(m => m.messageId && m.messageId.length > 0)
          .map(m => m.messageId)
      ];
      return newState;
    }
    case ActionTypes.MESSAGES_LOCK_REMOVE: {
      const newState = {...state};
      const remainingItems = [
        ...action.payload.filter(m => m.messageId && m.messageId.length > 0).map(m => m.messageId)
      ];
      newState.locked = [];
      for (const messageId of state.locked) {
        const i = remainingItems.indexOf(messageId);
        if (i > -1) {
          remainingItems.splice(i, 1);
        } else {
          newState.locked.push(messageId);
        }
      }
      return newState;
    }
    default:
      return state;
  }
};

export default messages;
