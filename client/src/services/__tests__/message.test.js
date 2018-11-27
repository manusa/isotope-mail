import * as messageService from '../message';
import * as messageActions from '../../actions/messages';
import * as fetch from '../fetch';

describe('Message service test suite', () => {
  describe('deleteMessages', () => {
    test('deleteMessages with valid message array, should fetch and dispatch results', () => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/?id=1&id=1337');
        return Promise.resolve({ok: true, url, options, json: Promise.resolve({})});
      });
      fetch.abortFetch = jest.fn();
      messageActions.deleteFromCache = jest.fn();
      messageActions.setSelected = jest.fn();
      const dispatch = jest.fn();
      const credentials = {};
      const folder = {_links: {messages: {href: 'http://test.url'}}};
      const messages = [{uid: 1}, {uid: 1337}];

      // When
      messageService.deleteMessages(dispatch, credentials, folder, messages);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(messageActions.deleteFromCache).toHaveBeenCalledTimes(1);
      expect(messageActions.setSelected).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('deleteMessages with empty message array, should do nothing', () => {
      // Given
      global.fetch = jest.fn();
      fetch.abortFetch = jest.fn();
      const dispatch = jest.fn();
      const messages = [];

      // When
      messageService.deleteMessages(dispatch, null, null, messages);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(0);
      expect(global.fetch).toHaveBeenCalledTimes(0);
    });
  });
});
