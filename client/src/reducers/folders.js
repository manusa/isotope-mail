import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';
import {explodeFolders} from '../services/folder';

function _updateFolder(folderToReplace, folders) {
  if (!folders || !folders.length > 0) {
    return [];
  }
  return folders.map(f => {
    if (f.children && f.children.length > 0) {
      f.children = _updateFolder(folderToReplace, f.children);
    }
    if (f.folderId === folderToReplace.folderId) {
      return {...folderToReplace};
    }
    return {...f};
  });
}

const folders = (state = INITIAL_STATE.folders, action= {}) => {
  switch (action.type) {
    case ActionTypes.FOLDERS_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.FOLDERS_SET: {
      const newItems = [...action.payload];
      return {
        ...state,
        items: newItems,
        explodedItems: explodeFolders(newItems),
        activeRequests: state.activeRequests - 1
      };
    }
    case ActionTypes.FOLDERS_UPDATE: {
      const newUpdateState = {...state};
      newUpdateState.items = _updateFolder(action.payload, newUpdateState.items);
      newUpdateState.explodedItems = explodeFolders(newUpdateState.items);
      return newUpdateState;
    }
    default:
      return state;
  }
};

export default folders;
