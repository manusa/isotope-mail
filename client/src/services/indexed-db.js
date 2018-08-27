import idb from 'idb';
import sjcl from 'sjcl';
import {processFolders} from './folder';
import {setError} from '../actions/application';

const DATABASE_NAME = 'isotope';
const DATABASE_VERSION = 1;
const STATE_STORE = 'state';
const MESSAGE_CACHE_STORE = 'message_cache';

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
      if (!upgradeDb.objectStoreNames.contains(MESSAGE_CACHE_STORE)) {
        const messageCacheStore = upgradeDb.createObjectStore(MESSAGE_CACHE_STORE, {keyPath: 'key'});
        messageCacheStore.createIndex('userId', 'userId', {unique: false});
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

async function _recoverMessageCache(userId, hash) {
  const ret = {};
  const db = await _openDatabaseSafe();
  const tx = db.transaction([MESSAGE_CACHE_STORE], 'readonly');
  const store = tx.objectStore(MESSAGE_CACHE_STORE);
  const index = store.index('userId');
  const keys = await index.getAllKeys(IDBKeyRange.only(userId));
  for (const key of keys) {
    const encryptedMessageCache = await store.get(key);
    const messages = JSON.parse(sjcl.decrypt(hash, encryptedMessageCache.messages))
    ret[sjcl.decrypt(hash, encryptedMessageCache.folderId)] =
      new Map(messages.map(m => [m.uid, m]));
  }
  return ret;
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
  // Recover message cache from other store
  recoveredState.messages.cache = await _recoverMessageCache(userId, hash);
  //  Process folders
  recoveredState.folders.items = processFolders(recoveredState.folders.items);
  if (recoveredState.application.selectedFolder) {
    recoveredState.application.selectedFolder = processFolders([recoveredState.application.selectedFolder])[0];
  }
  db.close();
  return recoveredState;
}

/**
 * Persists the message cache and folder items from the provided state into the Browser IndexedDB state store.
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
    const newState = {...state};
    newState.folders = {...state.folders};
    newState.folders.items = [...state.folders.items];
    newState.messages = {...state.messages};
    newState.messages.cache = {};
    // Object.entries(state.messages.cache).forEach(e => {
    //   newState.messages.cache[e[0]] = Array.from(e[1].values());
    // });
    const stateString = JSON.stringify(newState);
    const encryptedState = sjcl.encrypt(state.application.user.hash, stateString);
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

/**
 * Persists the provided array of messages into the Browser IndexedDB message cache store for the
 * specified userId and folder
 *
 * Stored entities are encrypted using the user hash {@link #login}
 *
 * @param userId
 * @param hash
 * @param folder {object}
 * @param messages {Array}
 * @returns {Promise<void>}
 */
export async function persistMessageCache(userId, hash, folder, messages) {
  const db = await _openDatabaseSafe();
  const tx = db.transaction([MESSAGE_CACHE_STORE], 'readwrite');
  const store = tx.objectStore(MESSAGE_CACHE_STORE);
  const messageCache = {
    // Key will not be used for data retrieval, index will be used instead
    // Key is only used to overwrite previous versions of the message cache, a has is enough
    key: sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`${userId}|${folder.folderId}`)),
    userId: userId,
    folderId: sjcl.encrypt(hash, folder.folderId),
    messages: sjcl.encrypt(hash, JSON.stringify(messages))
  }
  await store.put(messageCache);
  await tx.complete;
  db.close();
}
