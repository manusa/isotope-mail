import sjcl from 'sjcl';
import {backendRequest, backendRequestCompleted, selectFolder, setUserCredentials} from '../actions/application';
import {toJson} from './fetch';
import {recoverState} from './indexed-db';
import {getFolders} from './folder';
import {setFolders} from '../actions/folders';
import {setCache} from '../actions/messages';
import {resetFolderMessagesCache} from './message';

/**
 * @typedef {Object} Credentials
 * @property {string} serverHost - IMAP host
 * @property {string} serverPort - IMAP port
 * @property {string} user - User
 * @property {string} password - Password
 */
/**
 * Performs a login to the IMAP server using the API.
 *
 * If the server validates the credentials, previous state is reloaded (if exists) from IndexedDB.
 *
 * If previous state exists, message cache, folder list, and selected folder will be pre-populated with existing values.
 * An initial call to the backend will be made to refresh the list of messages of the selected folder.
 *
 * If a previous state doesn't exist, an initial load of the first level folders will be requested to the server.
 *
 * @param dispatch {Dispatch & function}
 * @param credentials {Credentials}
 * @returns {Promise<void>}
 */
export async function login(dispatch, credentials) {
  dispatch(backendRequest());
  let url = '/api/v1/application/login';
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:9010/v1/application/login';
  }
  // Will be used as the key in the IndexedDB
  const userId = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(`${credentials.serverHost}-${credentials.user}`));
  // Will be used as the encryption password to store state in the IndexedDB
  const hash = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(`${credentials.serverHost}-${credentials.user}-${credentials.password}`));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  dispatch(backendRequestCompleted());
  if (response.ok) {
    const validatedCredentials = await toJson(response);
    await dispatch(setUserCredentials(userId, hash, validatedCredentials));
    // Reload data from indexedDb
    const recoveredState = await recoverState(userId, hash);
    if (recoveredState !== null) {
      await dispatch(setFolders(recoveredState.folders.items));
      dispatch(selectFolder(recoveredState.application.selectedFolder));
      dispatch(setCache(recoveredState.messages.cache));
      // Refresh currently selected folder
      resetFolderMessagesCache(dispatch, validatedCredentials, recoveredState.application.selectedFolder, null);
    } else {
      // Retrieve first level folders to show something ASAP
      getFolders(dispatch, validatedCredentials, false);
    }
  }
}
