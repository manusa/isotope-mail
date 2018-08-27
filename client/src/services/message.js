import {backendRequest, backendRequestCompleted, setFolderCache, updateCache} from '../actions/messages';
import {credentialsHeaders, toJson} from './fetch';
import {persistMessageCache} from './indexed-db';
import {KEY_HASH, KEY_USER_ID} from './state';

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param signal {AbortSignal}
 */
export async function resetFolderMessagesCache(dispatch, credentials, folder, signal) {
  if (folder && folder._links) {
    dispatch(backendRequest());
    return fetch(folder._links.messages.href, {
      method: 'GET',
      headers: credentialsHeaders(credentials),
      signal: signal
    })
      .then(response => {
        dispatch(backendRequestCompleted());
        return response;
      })
      .then(toJson)
      .then(json => {
        dispatch(setFolderCache(folder, json));
        // Manually persist newest version of message cache
        persistMessageCache(sessionStorage.getItem(KEY_USER_ID), sessionStorage.getItem(KEY_HASH), folder, json);
      })
      .catch(error => {
        dispatch(backendRequestCompleted());
      });
  }
  return null;
}

export function updateFolderMessagesCache(dispatch, credentials, folder, signal, start, end) {
  const url = new URL(folder._links.messages.href);
  if (start >= 0 && end >= 0) {
    url.search = new URLSearchParams({start, end}).toString();
  }
  dispatch(backendRequest());
  fetch(url, {
    method: 'GET',
    headers: credentialsHeaders(credentials),
    signal: signal
  })
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(toJson)
    .then(json => {
      dispatch(updateCache(folder, json));
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
