import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';

function _updateFolder(folderToReplace, folders) {
  if (!folders || !folders.length > 0) {
    return [];
  }
  return folders.map(f => {
    _updateFolder(folderToReplace, f.children);
    if (f.folderId === folderToReplace.folderId) {
      return {...folderToReplace};
    }
    return {...f};
  });
}

const folders = (state = INITIAL_STATE.folders, action) => {
  switch (action.type) {
    case ActionTypes.FOLDERS_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.FOLDERS_SET:
      return {...state,
        items: [...action.payload],
        activeRequests: state.activeRequests - 1
      };
    case ActionTypes.FOLDERS_UPDATE: {
      const newUpdateState = {...state};
      newUpdateState.items = _updateFolder(action.payload, newUpdateState.items);
      return newUpdateState;
    }
    case ActionTypes.FOLDERS_ADD:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
};

export default folders;
