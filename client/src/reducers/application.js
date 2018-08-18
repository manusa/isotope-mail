import {initialState} from './';
import {ActionTypes} from '../actions/action-types';

const application = (state = initialState.application, action) => {
  switch (action.type) {
    case ActionTypes.APPLICATION_BE_REQUEST:
      return {...state, activeRequests: state.activeRequests + 1};
    case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
      return {...state, activeRequests: state.activeRequests > 0 ? state.activeRequests - 1 : 0};
    case ActionTypes.APPLICATION_USER_CREDENTIALS_SET:
      return {...state, user: {...state.user, credentials: action.payload}};
    default:
      return state;
  }
}

export default application;
