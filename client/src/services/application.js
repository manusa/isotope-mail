import sjcl from 'sjcl';
import {backendRequest, backendRequestCompleted, setUserCredentials} from '../actions/application';
import {toJson} from './fetch';
import {recoverState} from './indexed-db';
import {setFolders} from '../actions/folders';
import {setCache} from '../actions/messages';

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
      dispatch(setFolders(recoveredState.folders.items));
      dispatch(setCache(recoveredState.messages.cache));
    }
  }
}
