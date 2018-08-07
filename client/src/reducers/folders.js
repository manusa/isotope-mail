import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const folders = (state = initialState.folders, action) => {
  switch (action.type) {
    case ActionTypes.ADD_FOLDER:
      // return {...state, folders: [...state.folders, action.payload]}
      return [...state, action.payload];
    default:
      return state;
  }
}

export default folders;
