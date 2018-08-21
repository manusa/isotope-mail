import {backendRequest, backendRequestCompleted, setUserCredentials} from '../actions/application';
import {toJson} from './fetch';

export function login(dispatch, credentials) {
  dispatch(backendRequest());
  let url = '/api/v1/application/login';
  if (process.env.NODE_ENV === 'development') {
    url = 'http://localhost:9010/v1/application/login';
  }
  fetch(url, {
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
