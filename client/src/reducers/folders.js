import {INITIAL_STATE} from './';
import {ActionTypes} from '../actions/action-types';
import {explodeFolders, FolderTypes, gatherFolderIds, removeAttributesFromFolders} from '../services/folder';

function _updateFolder(folderToReplace, foldersToBeReplaced) {
  if (!foldersToBeReplaced || foldersToBeReplaced.length === 0) {
    return [];
  }
  return foldersToBeReplaced.map(f => {
    if (f.children && f.children.length > 0) {
      f.children = _updateFolder(folderToReplace, f.children);
    }
    if (f.folderId === folderToReplace.folderId) {
      // Keep trash attribute (may have been arbitrarily set from API server when loading initial complete folder tree)
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
        items: removeAttributesFromFolders(newItems),
        explodedItems: explodeFolders(newItems),
        activeRequests: state.activeRequests - 1
      };
    }
    case ActionTypes.FOLDERS_UPDATE: {
      const newUpdateState = {...state};
      newUpdateState.items = removeAttributesFromFolders(_updateFolder(action.payload, newUpdateState.items));
      // Update changed folders
      newUpdateState.explodedItems = {...newUpdateState.explodedItems, ...explodeFolders([action.payload])};
      // Remove any deleted folder
      const remainingFolderIds = Object.keys(explodeFolders(newUpdateState.items));
      Object.keys(newUpdateState.explodedItems)
        .filter(key => !remainingFolderIds.includes(key))
        .forEach(key => delete newUpdateState.explodedItems[key]);
      return newUpdateState;
    }
    /**
     * Will update only properties relative to the folder in the payload (children will be ignored)
     */
    case ActionTypes.FOLDERS_UPDATE_PROPERTIES: {
      const newUpdateState = {...state};
      const updatedFolder = {...action.payload};
      delete updatedFolder.childern;
      if (newUpdateState.explodedItems[updatedFolder.folderId]) {
        newUpdateState.explodedItems[updatedFolder.folderId] = {
          ...newUpdateState.explodedItems[updatedFolder.folderId],
          ...updatedFolder
        };
      }
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
        gatherFolderIds(newState.explodedItems[oldFolderId]).forEach(
          folderToDeleteId => delete newState.explodedItems[folderToDeleteId]);

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
