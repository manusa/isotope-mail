import {backendRequest, backendRequestCompleted, setFolderCache, updateCache} from '../actions/messages';
import {credentialsHeaders, toJson} from './fetch';

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param signal {AbortSignal}
 */
export function resetFolderMessagesCache(dispatch, credentials, folder, signal) {
  dispatch(backendRequest());
  fetch(folder._links.messages.href, {
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
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
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
