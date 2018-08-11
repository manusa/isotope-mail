import {backendRequest, setFolders} from '../actions/folders';

export const FolderTypes = Object.freeze({
  INBOX: {serverName: 'INBOX', icon: 'inbox'},
  FOLDER: {serverName: 'na', icon: 'folder'}
})

function processFolders(initialFolders) {
  const folders = [];
  initialFolders.map(folder => {
    if (folder.name.toUpperCase() === FolderTypes.INBOX.serverName) {
      folder.type = FolderTypes.INBOX;
      folders.unshift(folder);
    } else {
      folder.type = FolderTypes.FOLDER;
      folders.push(folder);
    }
    folder.children = processFolders(folder.children);
  });
  return folders;
}

export function getFolders(dispatch) {
  dispatch(backendRequest());
  fetch('http://localhost:9010/v1/folders')
    .then(response => (response.json()))
    .then(json =>
      dispatch(setFolders(processFolders(json)))
    );
}

