import {INITIAL_STATE} from './index';
import {ActionTypes} from '../actions/action-types';


const login = (state = INITIAL_STATE.login, action = {}) => {
  if (action.type === ActionTypes.LOGIN_FORM_VALUES_SET) {
    const newState = {...state, formValues: {...action.payload}};
    delete newState.formValues.password;
    return newState;
  }
  return state;
};

export default login;
