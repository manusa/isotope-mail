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
    test('User not logged in with advanced toggled on, should render Login with advanced view', () => {
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
      login.setState({advanced: true});

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
  describe('Initial values', () => {
    test('Initial values from URL Params', () => {
      // Given
      const location = {
        search: '?serverHost=server.host&serverPort=1337&user=user@user&imapSsl=false' +
        '&smtpHost=smtp.host&smtpPort=313373&smtpSsl=false'
      };
      const props = {
        t: jest.fn(messageKey => messageKey),
        location,
        application: INITIAL_STATE.application
      };
      // When
      const login = shallow(<Login {...props}/>);
      // Then
      expect(login.state().values.serverHost).toBe('server.host');
      expect(login.state().values.serverPort).toBe('1337');
      expect(login.state().values.user).toBe('user@user');
      expect(login.state().values.imapSsl).toBe(false);
      expect(login.state().values.smtpHost).toBe('smtp.host');
      expect(login.state().values.smtpPort).toBe('313373');
      expect(login.state().values.smtpSsl).toBe(false);
    });
    test('Initial values from Redux', () => {
      // Given
      const location = {
        search: '?serverHost=server.host'
      };
      const props = {
        t: jest.fn(messageKey => messageKey),
        location,
        formValues: {
          serverHost: 'server.redux.host',
          serverPort: 1337,
          user: 'user@redux',
          imapSsl: false,
          smtpHost: 'smtp.host',
          smtpPort: 313373,
          smtpSsl: false
        },
        application: INITIAL_STATE.application
      };
      // When
      const login = shallow(<Login {...props}/>);
      // Then
      expect(login.state().values.serverHost).toBe('server.redux.host');
      expect(login.state().values.serverPort).toBe(1337);
      expect(login.state().values.user).toBe('user@redux');
      expect(login.state().values.imapSsl).toBe(false);
      expect(login.state().values.smtpHost).toBe('smtp.host');
      expect(login.state().values.smtpPort).toBe(313373);
      expect(login.state().values.smtpSsl).toBe(false);
    });
  });
});
