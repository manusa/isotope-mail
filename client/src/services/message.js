import {backendRequest, backendRequestCompleted, loadFromCache, setMessages, updateCache} from '../actions/messages';

/**
 *
 * @param dispatch
 * @param folder
 * @param signal {AbortSignal}
 */
export function getMessages(dispatch, folder, signal) {
  dispatch(backendRequest());
  dispatch(loadFromCache(folder));
  const url = folder._links.messages.href;
  fetch(url, {signal})
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(response => (response.json()))
    .then(json => {
      dispatch(setMessages(json));
      dispatch(updateCache(folder, json));
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
