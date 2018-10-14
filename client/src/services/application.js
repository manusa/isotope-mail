import sjcl from 'sjcl';
import {URLS} from './url';
import {
  backendRequest,
  backendRequestCompleted,
  editMessage,
  selectFolder,
  setUserCredentials
} from '../actions/application';
import {toJson} from './fetch';
import {FolderTypes, getFolders} from './folder';
import i18n from './i18n';
import {recoverState} from './indexed-db';
import {setFolders} from '../actions/folders';
import {setCache} from '../actions/messages';
import {resetFolderMessagesCache} from './message';
import sanitize from './sanitize';

export const DEFAULT_IMAP_PORT = 993;
export const DEFAULT_IMAP_SSL = true;
export const DEFAULT_SMTP_PORT = 465;
export const DEFAULT_SMTP_SSL = true;

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
  const url = URLS.LOGIN;
  // Will be used as the key in the IndexedDB
  const userId = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(`${credentials.serverHost}|${credentials.user}`));
  // Will be used as the encryption password to store state in the IndexedDB
  const hash = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(`${credentials.serverHost}|${credentials.user}|${credentials.password}`));

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
    dispatch(setUserCredentials(userId, hash, validatedCredentials));
    // Reload data from indexedDb
    const recoveredState = await recoverState(userId, hash);
    if (recoveredState !== null) {
      await dispatch(setCache(recoveredState.messages.cache));
      await dispatch(setFolders(recoveredState.folders.items));
      dispatch(selectFolder(recoveredState.application.selectedFolder));
    } else {
      // Retrieve first level folders to show something ASAP
      const folders = await getFolders(dispatch, validatedCredentials, false);
      // Retrieve and select INBOX folder so that user has something in the screen
      const inbox = folders.find(f => f.type === FolderTypes.INBOX);
      if (inbox) {
        dispatch(selectFolder(inbox));
        resetFolderMessagesCache(dispatch, validatedCredentials, inbox, null);
      }
    }
  }
}

export function editNewMessage(dispatch) {
  dispatch(editMessage({to: [], cc: [], bcc: [], subject: '', content: ''}));
}

export function replyMessage(dispatch, originalMessage) {
  const recipients = [...originalMessage.recipients];
  const recipientMapper = r => r.address;
  const to = recipients.filter(r => r.type === 'To').map(recipientMapper).concat(originalMessage.from);
  const cc = recipients.filter(r => r.type === 'Cc').map(recipientMapper);
  const bcc = recipients.filter(r => r.type === 'Bcc').map(recipientMapper);
  const subject = `Re: ${originalMessage.subject}`;
  const formattedDate = new Date(originalMessage.receivedDate).toLocaleString(navigator.language, {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const t = i18n.t.bind(i18n);
  const content = `
    <p></p>
    <hr/>
    <p>
      <b>${t('replyAction.From')}:</b> ${originalMessage.from.join(', ')}<br/>
      <b>${t('replyAction.Date')}:</b> ${formattedDate}<br/>
      <b>${t('replyAction.Subject')}:</b> ${originalMessage.subject}<br/>
    </p>
    <br/>
    ${sanitize.sanitize(originalMessage.content)}
  `;

  dispatch(editMessage({to, cc, bcc, subject, content
  }));
}
