import React from 'react';
import {shallow} from 'enzyme/build/index';
import {LoginSnackbar} from '../login-snackbar';

describe('LoginSnackbar component test suite', () => {
  describe('Snapshot render', () => {
    test('Renders hidden', () => {
      // Given
      const error = null;

      // When
      const loginSnackbar = shallow(<LoginSnackbar error={error}/>);

      // Then
      expect(loginSnackbar).toMatchSnapshot();
    });
    test('Renders with error', () => {
      // Given
      const t = jest.fn(messageKey => messageKey);
      const error = 'BLACKLISTED';

      // When
      const loginSnackbar = shallow(<LoginSnackbar error={error} t={t}/>);

      // Then
      expect(loginSnackbar).toMatchSnapshot();
      expect(t).toHaveBeenCalledTimes(1);
    });
  });
});
