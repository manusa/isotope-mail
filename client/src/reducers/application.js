import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const application = (state = initialState.application, action) => {
  switch (action.type) {
    case ActionTypes.APPLICATION_USER_CREDENTIALS_SET:
      return {...state, user: {...state.user, credentials: action.payload}};
    default:
      return state;
  }
}

export default application;
