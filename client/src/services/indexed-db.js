import idb from 'idb';
import sjcl from 'sjcl';
import {processFolders} from './folder';
import {setError} from '../actions/application';

const DATABASE_NAME = 'isotope';
const DATABASE_VERSION = 1;
const STATE_STORE = 'state';

/**
 * Opens a connection to the IndexedDB for Isotope's database
 *
 * @returns {Promise<DB>}
 * @private
 */
function _openDatabase() {
  return idb.open(DATABASE_NAME, DATABASE_VERSION,
    upgradeDb => {
      if (!upgradeDb.objectStoreNames.contains(STATE_STORE)) {
        upgradeDb.createObjectStore(STATE_STORE, {keyPath: 'key'});
      }
    });
}

/**
 * Opens a connection to the IndexedDB for Isotope's database.
 *
 * If the database exists but the state store doesn't, the DB is deleted and recreated.
 *
 * @returns {Promise<DB>}
 * @private
 */
async function _openDatabaseSafe() {
  let db = await _openDatabase();
  if (!db.objectStoreNames.contains(STATE_STORE)) {
    // Corrupted DB, recreate
    db.close();
    await idb.delete(DATABASE_NAME);
    db = await _openDatabase();
  }
  return db;
}

/**
 * Tries to recover a persisted state for the given userID and uses the hash as the cypher password to decrypt the
 * store value.
 *
 * @param userId {string}
 * @param hash {string}
 * @returns {Promise<*>}
 */
export async function recoverState(userId, hash) {
  const db = await _openDatabaseSafe();
  const tx = db.transaction([STATE_STORE], 'readonly');
  const store = tx.objectStore(STATE_STORE);
  const encryptedState = await store.get(userId);
  if (!encryptedState) {
    return null;
  }
  const decryptedState = sjcl.decrypt(hash, encryptedState.value);
  const recoveredState = JSON.parse(decryptedState);
  // Convert Array to Map after recovering
  Object.entries(recoveredState.messages.cache).forEach(e => {
    recoveredState.messages.cache[e[0]] = new Map(e[1].map(m => [m.uid, m]));
  });
  //  Process folders
  recoveredState.folders.items = processFolders(recoveredState.folders.items);
  if (recoveredState.application.selectedFolder) {
    recoveredState.application.selectedFolder = processFolders([recoveredState.application.selectedFolder])[0];
  }
  db.close();
  return recoveredState;
}

/**
 * Persists the message cache and folder items from the provided state into the Browser IndexedDB.
 *
 * Stored entities are encrypted using the user hash {@link #login}
 *
 * @param dispatch {(Dispatch<any>|function)}
 * @param state
 * @returns {Promise<void>}
 */
export async function persistState(dispatch, state) {
  // Only persist state if it contains a folder and message cache (don't overwrite previously stored state with this info)
  if (state.application.user.id && state.application.user.hash
    && state.folders.items.length > 0 && Object.keys(state.messages.cache).length > 0) {
    // Clone state
    const newState = {...state};
    newState.application = {...state.application};
    newState.folders = {...state.folders};
    newState.folders.items = [...state.folders.items];
    newState.messages = {...state.messages};
    newState.messages.cache = {};
    Object.entries(state.messages.cache).forEach(e => {
      newState.messages.cache[e[0]] = Array.from(e[1].values());
    });

    // Encrypt state
    const stateString = JSON.stringify(newState);
    const encryptedState = sjcl.encrypt(state.application.user.hash, stateString);

    // Persist state
    try {
      const db = await _openDatabaseSafe();
      const tx = db.transaction([STATE_STORE], 'readwrite');
      const store = tx.objectStore(STATE_STORE);
      await store.put({key: state.application.user.id, value: encryptedState});
      await tx.complete;
      db.close();
      if (state.application.errors.diskQuotaExceeded) {
        dispatch(setError('diskQuotaExceeded', false));
      }
    } catch (e) {
      console.log(`${e} ${e.name}`);
      if (e.name === 'QuotaExceededError' && !state.application.errors.diskQuotaExceeded) {
        dispatch(setError('diskQuotaExceeded', true));
      }
    }
  }
}
