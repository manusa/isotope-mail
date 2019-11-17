import idb from 'idb';
import sjcl from 'sjcl';
import {processFolders} from './folder';
import {setError} from '../actions/application';
import SjclWorker from 'worker-loader?name=sjcl.worker.[hash].js&inline!./sjcl.worker.js';

const DATABASE_NAME = 'isotope';
const DATABASE_VERSION = 2;
const STATE_STORE = 'state';
const NEW_MESSAGE_STORE = 'new_message';
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
      if (!upgradeDb.objectStoreNames.contains(NEW_MESSAGE_STORE)) {
        upgradeDb.createObjectStore(NEW_MESSAGE_STORE, {keyPath: 'key'});
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
    const messages = JSON.parse(sjcl.decrypt(hash, encryptedMessageCache.messages));
    ret[sjcl.decrypt(hash, encryptedMessageCache.folderId)] =
      new Map(messages.map(m => [m.uid, m]));
  }
  return ret;
}

async function _recoverApplicationNewMessageContent(userId, hash) {
  const db = await _openDatabaseSafe();
  const tx = db.transaction([NEW_MESSAGE_STORE], 'readonly');
  const store = tx.objectStore(NEW_MESSAGE_STORE);
  const encryptedNewMessage = await store.get(userId);
  if (!encryptedNewMessage) {
    return '';
  }
  const decryptedNewMessage = sjcl.decrypt(hash, encryptedNewMessage.newMessageContent);
  return JSON.parse(decryptedNewMessage);
}

/**
 * Deletes applicationNewMessageContent entry from database
 *
 * @param application
 * @returns {Promise<void>}
 * @private
 */
export async function _deleteApplicationNewMessageContent(application) {
  if (application.user && application.user.id) {
    const db = await _openDatabaseSafe();
    const tx = db.transaction([NEW_MESSAGE_STORE], 'readwrite');
    const store = tx.objectStore(NEW_MESSAGE_STORE);
    await store.delete(application.user.id);
    await tx.complete;
    db.close();
  }
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
  // Recover new message content
  if (recoveredState.application.newMessage) {
    recoveredState.application.newMessage.content = await _recoverApplicationNewMessageContent(userId, hash);
  }
  // Process folders
  const mergeFolderItems = (folderTree, explodedFolders) =>
    folderTree.map(folder =>
      ({...explodedFolders[folder.folderId], children: mergeFolderItems(folder.children, explodedFolders)}));
  recoveredState.folders.items = processFolders(
    mergeFolderItems(recoveredState.folders.items, recoveredState.folders.explodedItems));
  // Recover message cache from other store
  recoveredState.messages.cache = await _recoverMessageCache(userId, hash);
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
    // Create web-worker
    const worker = new SjclWorker();
    worker.onmessage = async encryptedStateMessage => {
      // Persist state
      try {
        const db = await _openDatabaseSafe();
        const tx = db.transaction([STATE_STORE], 'readwrite');
        const store = tx.objectStore(STATE_STORE);
        await store.put({key: state.application.user.id, value: encryptedStateMessage.data.encryptedData});
        await tx.complete;
        db.close();
        if (state.application.errors.diskQuotaExceeded) {
          dispatch(setError('diskQuotaExceeded', false));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`${e} ${e.name}`);
        if (e.name === 'QuotaExceededError' && !state.application.errors.diskQuotaExceeded) {
          dispatch(setError('diskQuotaExceeded', true));
        }
      }
      worker.terminate();
      URL.revokeObjectURL(encryptedStateMessage.data.workerHref);
    };

    // Clone state
    const newState = {...state};
    newState.application = {...state.application};
    newState.application.downloadedMessages = {};
    newState.application.outbox = null;
    if (newState.application.newMessage) {
      // Persist everything from application.newMessage except content (persisted independently in message-editor
      // in a different db store
      newState.application.newMessage = {...newState.application.newMessage, attachments: [], content: ''};
    } else {
      // Delete any application.newMessage.content entry in the database
      await _deleteApplicationNewMessageContent(state.application);
    }

    newState.folders = {...state.folders};
    newState.folders.items = [...state.folders.items];

    newState.login = {...state.login};

    // Don't persist message related states (Own IndexedDB entry for message cache @see persistMessageCache)
    newState.messages = {};
    // Object.entries(state.messages.cache).forEach(e => {
    //   newState.messages.cache[e[0]] = Array.from(e[1].values());
    // });

    // Encrypt state
    const stateString = JSON.stringify(newState);
    worker.postMessage({password: state.application.user.hash, data: stateString});
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
  const worker = new SjclWorker();
  worker.onmessage = async m => {
    const messageCache = {
      // Key will not be used for data retrieval, index will be used instead
      // Key is only used to overwrite previous versions of the message cache, a has is enough
      key: sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`${userId}|${folder.folderId}`)),
      userId: userId,
      folderId: sjcl.encrypt(hash, folder.folderId),
      messages: m.data.encryptedData
    };
    const db = await _openDatabaseSafe();
    const tx = db.transaction([MESSAGE_CACHE_STORE], 'readwrite');
    const store = tx.objectStore(MESSAGE_CACHE_STORE);
    await store.put(messageCache);
    await tx.complete;
    db.close();
    worker.terminate();
    URL.revokeObjectURL(m.data.workerHref);
  };
  worker.postMessage({password: hash, data: JSON.stringify(messages)});
}

/**
 * Moves entries in the MESSAGE_CACHE_STORE.
 *
 * Will create a new entry for the key of the newly named folder and delete the previous entry for the key
 * of the former folder id (if exists).
 *
 * @param userId
 * @param hash
 * @param oldFolderId
 * @param newFolderId
 * @returns {Promise<void>}
 */
export async function renameMessageCache(userId, hash, oldFolderId, newFolderId) {
  if (!oldFolderId || !newFolderId || oldFolderId === newFolderId) {
    return;
  }
  const oldKey = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`${userId}|${oldFolderId}`));
  const newKey = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`${userId}|${newFolderId}`));
  const db = await _openDatabaseSafe();
  const tx = db.transaction([MESSAGE_CACHE_STORE], 'readwrite');
  const store = tx.objectStore(MESSAGE_CACHE_STORE);
  const oldFolderCache = await store.get(oldKey);
  if (oldFolderCache) {
    oldFolderCache.key = newKey;
    oldFolderCache.folderId = sjcl.encrypt(hash, newFolderId);
    await store.put(oldFolderCache);
    await store.delete(oldKey);
  }
  await tx.complete;
  db.close();
}

/**
 *  Deletes entries from MESSAGE_CACHE_STORE
 *
 * @param userId
 * @param hash
 * @param foldersToDeleteIds {Array} ids to delete from MESSAGE_CACHE_STORE
 * @returns {Promise<void>}
 */
export async function deleteMessageCache(userId, hash, foldersToDeleteIds) {
  const db = await _openDatabaseSafe();
  const tx = db.transaction([MESSAGE_CACHE_STORE], 'readwrite');
  const store = tx.objectStore(MESSAGE_CACHE_STORE);
  const keys = foldersToDeleteIds
    .map(folderId => sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(`${userId}|${folderId}`)));
  for (const key of keys) {
    await store.delete(key);
  }
  await tx.complete;
  db.close();
}

/**
 * Persists application.newMessage.content object in separate database
 * @param application
 * @param content
 * @returns {Promise<void>}
 */
export async function persistApplicationNewMessageContent(application, content = '') {
  const worker = new SjclWorker();
  worker.onmessage = async m => {
    const newMessage = {
      key: application.user.id,
      newMessageContent: m.data.encryptedData
    };
    const db = await _openDatabaseSafe();
    const tx = db.transaction([NEW_MESSAGE_STORE], 'readwrite');
    const store = tx.objectStore(NEW_MESSAGE_STORE);
    await store.put(newMessage);
    await tx.complete;
    db.close();
    worker.terminate();
    URL.revokeObjectURL(m.data.workerHref);
  };
  worker.postMessage({password: application.user.hash, data: JSON.stringify(content)});
}

