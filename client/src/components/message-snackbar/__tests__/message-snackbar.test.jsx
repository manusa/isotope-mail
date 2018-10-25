import React from 'react';
import {shallow} from 'enzyme/build/index';
import {MessageSnackbar} from '../message-snackbar';

describe('Snackbar component test suite', () => {
  describe('Snapshot render', () => {
    test('Renders hidden', () => {
      // Given
      const outbox = null;

      // When
      const messageSnackbar = shallow(<MessageSnackbar outbox={outbox}/>);

      // Then
      expect(messageSnackbar).toMatchSnapshot();
    });
    test('Renders with progress', () => {
      // Given
      const t = jest.fn((messageKey, {progress}) => `${messageKey} ${progress}`);
      const outbox = {sent: false, progress: 1337};

      // When
      const messageSnackbar = shallow(<MessageSnackbar outbox={outbox} t={t}/>);

      // Then
      expect(messageSnackbar).toMatchSnapshot();
      expect(t).toHaveBeenCalledTimes(1);
    });
    test('Renders with sent status', () => {
      // Given
      const t = jest.fn(messageKey => messageKey);
      const outbox = {sent: true, progress: 1337};

      // When
      const messageSnackbar = shallow(<MessageSnackbar outbox={outbox} t={t}/>);

      // Then
      expect(messageSnackbar).toMatchSnapshot();
      expect(t).toHaveBeenCalledTimes(1);
    });
  });
});
