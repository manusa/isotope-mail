import {INITIAL_STATE} from '../index';
import {ActionTypes} from '../../actions/action-types';
import login from '../login';

describe('Login reducer test suite', () => {
  describe('LOGIN_FORM_VALUES_SET', () => {
    test('Initial state contains no login formValues,' +
      'payload has formValues with password, should set new formValues without password', () => {
      // Given
      const initialState = {...INITIAL_STATE.login};
      // When
      const updatedState = login(initialState,
        {type: ActionTypes.LOGIN_FORM_VALUES_SET, payload: {user: 'Kwasi', password: 'Octonaut'}});
      // Then
      expect(initialState.formValues).toEqual({});
      expect(updatedState.formValues).toEqual({user: 'Kwasi'});
    });
    test('Initial state contains  login formValues,' +
      'empty payload, should set formValues empty', () => {
      // Given
      const initialState = {...INITIAL_STATE.login, formValues: {user: 'Kwasi'}};
      // When
      const updatedState = login(initialState,
        {type: ActionTypes.LOGIN_FORM_VALUES_SET, payload: {}});
      // Then
      expect(initialState.formValues).toEqual({user: 'Kwasi'});
      expect(updatedState.formValues).toEqual({});
    });
  });
});
