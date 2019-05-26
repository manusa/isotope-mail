import {
  activeMessageFilter,
  getCredentials,
  messageFilterActive,
  messageFilterKey,
  messageFilterText,
  outbox,
  pollInterval,
  selectedFolderId,
  selectedMessage
} from '../application';
import MessageFilters from '../../services/message-filters';

describe('application selectors test suite', () => {
  describe('getCredentials', () => {
    test('application.user with valid credentials and other properties, should return credentials', () => {
      // Given
      const state = {
        application: {
          user: {
            credentials: {
              authenticated: false,
              encrypted: '1337LEET',
              salt: '3313373',
              name: 'ELITE'
            },
            hash: 'e5e802104a2f161320a3b65d2bf30331b38627642e8e2e78f233933d9df63c27',
            id: '803fd1d3c21a38cebf730c2acf1a0ce400404290199db4a57e1229cf02b24584'
          }
        }
      };
      // When
      const result = getCredentials(state);
      // Then
      expect(result).toEqual({
        authenticated: false,
        encrypted: '1337LEET',
        salt: '3313373',
        name: 'ELITE'
      });
    });
  });
  test('selectedFolderId, application with selectedFolderId, should return selectedFolderId', () => {
    // Given
    const state = {application: {selectedFolderId: 1337}};
    // When
    const result = selectedFolderId(state);
    // Then
    expect(result).toBe(1337);
  });
  test('messageFilterKey, application with messageFilterKey, should return messageFilterKey', () => {
    // Given
    const state = {application: {messageFilterKey: 'ALL'}};
    // When
    const result = messageFilterKey(state);
    // Then
    expect(result).toBe('ALL');
  });
  test('messageFilterText, application with messageFilterText, should return messageFilterText', () => {
    // Given
    const state = {application: {messageFilterText: '1337'}};
    // When
    const result = messageFilterText(state);
    // Then
    expect(result).toBe('1337');
  });
  test('selectedMessage, application with selectedMessage, should return selectedMessage', () => {
    // Given
    const state = {application: {selectedMessage: {uid: 1337}}};
    // When
    const result = selectedMessage(state);
    // Then
    expect(result).toEqual({uid: 1337});
  });
  test('outbox, application with outbox, should return outbox', () => {
    // Given
    const state = {application: {outbox: {subject: '1337'}}};
    // When
    const result = outbox(state);
    // Then
    expect(result).toEqual({subject: '1337'});
  });
  test('pollInterval, application with pollInterval, should return pollInterval', () => {
    // Given
    const state = {application: {pollInterval: 1337}};
    // When
    const result = pollInterval(state);
    // Then
    expect(result).toBe(1337);
  });
  test('activeMessageFilter, application with messageFilterKey, should return messageFilter instance', () => {
    // Given
    const state = {application: {messageFilterKey: 'ALL'}};
    // When
    const result = activeMessageFilter(state);
    // Then
    expect(result).toBe(MessageFilters.ALL);
  });
  describe('messageFilterActive', () => {
    test('messageFilterKey=ALL and no messageFilterText, should return falsy', () => {
      // Given
      const state = {application: {messageFilterKey: 'ALL', messageFilterText: ''}};
      // When
      const result = messageFilterActive(state);
      // Then
      expect(result).toBeFalsy();
    });
    test('messageFilterKey=ALL and messageFilterText, should return falsy', () => {
      // Given
      const state = {application: {messageFilterKey: 'ALL', messageFilterText: '1337'}};
      // When
      const result = messageFilterActive(state);
      // Then
      expect(result).toBeTruthy();
    });
    test('messageFilterKey=READ and nomessageFilterText, should return falsy', () => {
      // Given
      const state = {application: {messageFilterKey: 'READ', messageFilterText: '1337'}};
      // When
      const result = messageFilterActive(state);
      // Then
      expect(result).toBeTruthy();
    });
  });
});
