import {backendRequest, setFolders} from '../actions/folders';
import {credentialsHeaders, toJson} from './fetch';

export const FolderTypes = Object.freeze({
  INBOX: {serverName: 'INBOX', icon: 'inbox', position: 0},
  DRAFTS: {attribute: '\\Drafts', icon: 'drafts', position: 1},
  SENT: {attribute: '\\Sent', icon: 'send', position: 2},
  TRASH: {attribute: '\\Trash', icon: 'delete', position: 3},
  FOLDER: {icon: 'folder'}
})

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
      specialFolders.splice(folder.type.position, 0, folder);
    } else {
      folder.type = FolderTypes.FOLDER;
      // Identify special folder
      let special = false;
      for (const t of [FolderTypes.DRAFTS, FolderTypes.SENT, FolderTypes.TRASH]) {
        if (folder.attributes && folder.attributes.includes(t.attribute)) {
          folder.type = t;
          specialFolders.splice(folder.type.position, 0, folder);
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

export async function getFolders(dispatch, credentials, loadChildren) {
  const url = new URL('/api/v1/folders', window.location.origin);
  if (loadChildren) {
    url.search = new URLSearchParams({loadChildren: true}).toString();
  }
  dispatch(backendRequest());
  const response = await fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials)
  });
  const folders = await toJson(response);
  const processedFolders = processFolders(folders);
  dispatch(setFolders(processedFolders));
  return processedFolders;
}

