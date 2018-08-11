import {backendRequest, setMessages} from '../actions/messages';


export function getMessages(dispatch, folder) {
  dispatch(setMessages([], false));
  dispatch(backendRequest());
  // TODO: remove hardcoded URL
  const url = folder && folder._links && folder._links.messages ? folder._links.messages.href :
    `http://localhost:9010/v1/folders/${folder}/messages`;
  fetch(url)
    .then(response => (response.json()))
    .then(json =>
      dispatch(setMessages(json, true))
    );
}
