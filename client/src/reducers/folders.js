import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';
import {explodeFolders, FolderTypes} from '../services/folder';

function _updateFolder(folderToReplace, folders) {
  if (!folders || !folders.length > 0) {
    return [];
  }
  return folders.map(f => {
    if (f.children && f.children.length > 0) {
      f.children = _updateFolder(folderToReplace, f.children);
    }
    if (f.folderId === folderToReplace.folderId) {
      // Keep trash attribute (may have been arbitrarily set from API server)
      if (f.type === FolderTypes.TRASH && folderToReplace.type !== FolderTypes.TRASH) {
        folderToReplace.attributes.push(FolderTypes.TRASH.attribute);
        folderToReplace.type = FolderTypes.TRASH;
      }
      return {...folderToReplace};
    }
    return {...f};
  });
}

const _deleteChildFolder = toDeleteFolderId => {
  const deleteChildFolderFunction = folder => {
    if (Array.isArray(folder.children)) {
      folder.children = folder.children.filter(child => child.folderId !== toDeleteFolderId);
      folder.children.forEach(deleteChildFolderFunction);
    }
  };
  return deleteChildFolderFunction;
};

const folders = (state = INITIAL_STATE.folders, action = {}) => {
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
    /**
     * Once a folder is renamed, previous references to that folder should be removed from the tree and exploded
     * tree state.
     * Other actions will have already taken care of adding the renamed folder to the new position, this action
     * is only responsible for the removal process.
     * This action should be triggered whenever a folder is renamed or moved within a mailbox.
     */
    case ActionTypes.APPLICATION_FOLDER_RENAME_OK: {
      const newState = {...state};
      // Remove previous folder from Tree
      const {oldFolderId} = action.payload;
      if (Object.keys(newState.explodedItems).includes(oldFolderId)) {
        // Delete from Exploded list (Parent + Children)
        const explodedFoldersToDeleteIds = [];
        const gatherDeletedFolderAndChildrenIds = folder => {
          explodedFoldersToDeleteIds.push(folder.folderId);
          if (Array.isArray(folder.children)) {
            folder.children.forEach(gatherDeletedFolderAndChildrenIds);
          }
        };
        gatherDeletedFolderAndChildrenIds(newState.explodedItems[oldFolderId]);
        explodedFoldersToDeleteIds.forEach(folderToDeleteId => delete newState.explodedItems[folderToDeleteId]);

        // Delete from tree (root folders)
        newState.items = newState.items.filter(item => item.folderId !== oldFolderId);
        // Delete from tree (child folders)
        newState.items.forEach(_deleteChildFolder(oldFolderId));
      }
      return newState;
    }
    default:
      return state;
  }
};

export default folders;
