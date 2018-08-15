import {setUserCredentials} from '../actions/application';

export function login(dispatch, credentials) {
  fetch('http://localhost:9010/v1/application/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(response => (response.json()))
    .then(json =>
      dispatch(setUserCredentials(json))
    );
}
