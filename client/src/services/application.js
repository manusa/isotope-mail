import {backendRequest, backendRequestCompleted, setUserCredentials} from '../actions/application';
import {toJson} from './fetch';

export function login(dispatch, credentials) {
  dispatch(backendRequest());
  fetch('http://localhost:9010/v1/application/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(response => {
      dispatch(backendRequestCompleted());
      return response;
    })
    .then(toJson)
    .then(({encrypted, salt}) =>
      dispatch(setUserCredentials({encrypted, salt}))
    )
    .catch(error => {
      dispatch(backendRequestCompleted());
    });
}
