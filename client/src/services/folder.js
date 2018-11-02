import {URLS} from './url';
import {
  backendRequest as applicationBackendRequest,
  backendRequestCompleted as applicationBackendRequestCompleted,
  renameFolder as renameFolderAction} from '../actions/application';
import {backendRequest, setFolders, updateFolder} from '../actions/folders';
import {abortControllerWrappers, abortFetch, credentialsHeaders, toJson} from './fetch';

export const FolderTypes = Object.freeze({
  INBOX: {serverName: 'INBOX', icon: 'inbox', position: 0},
  DRAFTS: {attribute: '\\Drafts', icon: 'drafts', position: 1},
  SENT: {attribute: '\\Sent', icon: 'send', position: 2},
  TRASH: {attribute: '\\Trash', icon: 'delete', position: 3},
  FOLDER: {icon: 'folder'}
});

/**
 * Processes an initial folder list and adds the corresponding {@link FolderTypes}
 *
 * @param initialFolders {Array}
 * @returns {Array}
 */
export function processFolders(initialFolders) {
  if (!initialFolders) {
    return null;
  }
  const folders = [];
  const specialFolders = [];
  initialFolders.map(folder => {
    if (folder.name && folder.name.toUpperCase() === FolderTypes.INBOX.serverName) {
      folder.type = FolderTypes.INBOX;
      specialFolders[folder.type.position] = folder;
    } else {
      folder.type = FolderTypes.FOLDER;
      // Identify special folder
      let special = false;
      for (const t of [FolderTypes.DRAFTS, FolderTypes.SENT, FolderTypes.TRASH]) {
        if (folder.attributes && folder.attributes.includes(t.attribute)) {
          folder.type = t;
          specialFolders[folder.type.position] = folder;
          special = true;
          break;
        }
      }
      // If regular folder just add to the folder array
      if (!special) {
        folders.push(folder);
      }
    }
    folder.children = processFolders(folder.children);
  });
  // Insert special folders in specific positions
  specialFolders.reverse().forEach(f => folders.unshift(f));
  return folders;
}

/**
 * Builds an object containing all of the folders and their children at the same level
 */
export function explodeFolders(originalFolders, explodedFolders = {}) {
  originalFolders.forEach(f => {
    explodedFolders[f.folderId] = f;
    if (f.children && f.children.length > 0) {
      explodeFolders(f.children, explodedFolders);
    }
  });
  return explodedFolders;
}

export async function getFolders(dispatch, credentials, loadChildren) {
  abortFetch(abortControllerWrappers.getFoldersAbortController);
  abortControllerWrappers.getFoldersAbortController = new AbortController();
  const signal = abortControllerWrappers.getFoldersAbortController.signal;

  const url = new URL(URLS.FOLDERS, window.location.origin);
  if (loadChildren) {
    url.search = new URLSearchParams({loadChildren: true}).toString();
  }
  dispatch(backendRequest());
  const response = await fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials),
    signal: signal
  });
  const folders = await toJson(response);
  dispatch(setFolders(folders));
}

export function renameFolder(dispatch, credentials, folderToRename, newName) {
  abortFetch(abortControllerWrappers.getFoldersAbortController);
  dispatch(applicationBackendRequest());
  fetch(folderToRename._links.rename.href, {
    method: 'PUT',
    headers: credentialsHeaders(credentials, {'Content-Type': 'application/json'}),
    body: newName
  })
    .then(toJson)
    .then(renamedFolderParent => {
      if (renamedFolderParent.fullName.length === 0) {
        // Root folder (replace current folder tree)
        dispatch(setFolders(renamedFolderParent.children));
      } else {
        dispatch(updateFolder(renamedFolderParent));
      }
      dispatch(renameFolderAction(null));
      dispatch(applicationBackendRequestCompleted());
    })
    .catch(error => {
      dispatch(applicationBackendRequestCompleted());
    });
}

