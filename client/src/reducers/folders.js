import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const folders = (state = initialState.folders, action) => {
  switch (action.type) {
    case ActionTypes.FOLDERS_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.FOLDERS_SET:
      return {...state,
        items: [...action.payload],
        activeRequests: state.activeRequests - 1
      };
    case ActionTypes.FOLDERS_ADD:
      return {...state, items: [...state.items, action.payload]};
    default:
      return state;
  }
}

export default folders;
