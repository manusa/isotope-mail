import {backendRequest, backendRequestCompleted, updateCache} from '../actions/messages';

/**
 *
 * @param dispatch
 * @param folder
 * @param signal {AbortSignal}
 */
export function updateFolderMessagesCache(dispatch, folder, signal) {
  dispatch(backendRequest());
  fetch(folder._links.messages.href, {signal})
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(response => (response.json()))
    .then(json => {
      dispatch(updateCache(folder, json));
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
