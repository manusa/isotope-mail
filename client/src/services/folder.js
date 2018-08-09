import {resetFolders} from '../actions/folders';

export function getFolders(dispatch) {
  fetch('http://localhost:9010/v1/folders')
    .then(response => (response.json()))
    .then(json =>
      dispatch(resetFolders(json))
    );
}
