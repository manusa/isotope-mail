import {backendRequest, backendRequestCompleted, updateCache} from '../actions/messages';
import {credentialsHeaders, toJson} from './fetch';

/**
 *
 * @param dispatch
 * @param credentials
 * @param folder
 * @param signal {AbortSignal}
 */
export function updateFolderMessagesCache(dispatch, credentials, folder, signal) {
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
      dispatch(updateCache(folder, json));
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
