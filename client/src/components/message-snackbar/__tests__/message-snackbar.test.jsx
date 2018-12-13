import React from 'react';
import {shallow} from 'enzyme';
import {createMockStore} from '../../../__testutils__/store';
import ConnectedMessageSnackbar, {MessageSnackbar} from '../message-snackbar';
import i18n from '../../../services/i18n';
import * as applicationActions from '../../../actions/application';
import * as applicationService from '../../../services/application';
import {INITIAL_STATE} from '../../../reducers';

describe('MessageSnackbar component test suite', () => {
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
    test('Renders with error', () => {
      // Given
      const t = jest.fn(messageKey => messageKey);
      const outbox = {sent: false, error: true, progress: 1337};

      // When
      const messageSnackbar = shallow(<MessageSnackbar outbox={outbox} t={t}/>);

      // Then
      expect(messageSnackbar).toMatchSnapshot();
      expect(t).toHaveBeenCalledTimes(2);
    });
  });
  describe('Event tests', () => {
    test('Retry button clicked', () => {
      // Given
      const outbox = {sent: false, error: true, progress: 1337, message: {recipients: []}};
      const initialState = {...INITIAL_STATE};
      initialState.application.outbox = outbox;
      const mockAction = {type: 'MOCK', action: 'MOCK'}
      applicationActions.outboxMessageProcessed = jest.fn(() => mockAction);
      applicationService.editMessageAsNew = jest.fn();
      const messageSnackbar = shallow(
        <ConnectedMessageSnackbar store={createMockStore(initialState)} i18n={i18n} outbox={outbox}/>);

      // When
      messageSnackbar.props().retry();

      // Then
      expect(applicationActions.outboxMessageProcessed).toHaveBeenCalledTimes(1);
      expect(applicationService.editMessageAsNew).toHaveBeenCalledTimes(1);
    });
  });
});
