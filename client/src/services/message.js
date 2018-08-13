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
  // TODO: remove hardcoded URL
  const url = folder && folder._links && folder._links.messages ? folder._links.messages.href :
    `http://localhost:9010/v1/folders/${folder}/messages`;
  fetch(url, {signal})
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(response => (response.json()))
    .then(json => {
      dispatch(setMessages(json));
      // TODO: remove when removing hardcoded URL
      if (folder._links) {
        dispatch(updateCache(folder, json));
      }
    })
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
