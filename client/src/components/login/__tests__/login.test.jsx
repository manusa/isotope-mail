import React from 'react';
import {shallow} from 'enzyme/build/index';
import {Login} from '../login';
import {INITIAL_STATE} from '../../../reducers';

describe('LoginSnackbar component test suite', () => {
  describe('Snapshot render', () => {
    test('User not logged in, should render Login', () => {
      // Given
      const props = {
        t: jest.fn(messageKey => messageKey),
        location: {
          search: ''
        },
        application: INITIAL_STATE.application
      };

      // When
      const login = shallow(<Login {...props}/>);

      // Then
      expect(login).toMatchSnapshot();
    });
    test('User logged in, should render Redirect', () => {
      // Given
      const props = {
        t: jest.fn(messageKey => messageKey),
        location: {
          search: ''
        },
        application: {...INITIAL_STATE.application, user: {credentials: {encrypted: 'encrypted', salt: 'salt'}}}
      };

      // When
      const login = shallow(<Login {...props}/>);

      // Then
      expect(login).toMatchSnapshot();
    });
  });
});
