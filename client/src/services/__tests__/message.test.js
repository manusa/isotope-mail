import * as messageService from '../message';
import * as messageActions from '../../actions/messages';
import * as fetch from '../fetch';
import {ActionTypes} from '../../actions/action-types';

describe('Message service test suite', () => {
  describe('deleteMessages', () => {
    test('deleteMessages with valid message array, should fetch and dispatch results', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/?id=1&id=1337');
        return Promise.resolve({ok: true, url, options, json: () => Promise.resolve({fromServer: true})});
      });
      fetch.abortFetch = jest.fn();
      messageActions.deleteFromCache = jest.fn();
      messageActions.setSelected = jest.fn();
      const dispatch = jest.fn()
        .mockImplementation(action => {
          if (action && action.type === ActionTypes.FOLDERS_UPDATE) {
            expect(action.payload.fromServer).toEqual(true);
            done();
          }
        });
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
    test('deleteMessages with valid message array, fetch has error, should dispatch previous folder/messages', done => {
      // Given
      global.fetch = jest.fn(url => {
        expect(url.toLocaleString()).toMatch('http://test.url.witherror/?id=1&id=1337');
        return Promise.resolve({ok: true});
      });
      fetch.abortFetch = jest.fn();
      const dispatch = jest.fn()
        .mockImplementation(action => {
          if (action && action.type === ActionTypes.FOLDERS_UPDATE) {
            expect(action.payload.originalFolder).toEqual(true);
            done();
          }
        });
      const credentials = {};
      const folder = {_links: {messages: {href: 'http://test.url.witherror'}}, originalFolder: true};
      const messages = [{uid: 1}, {uid: 1337}];

      // When
      messageService.deleteMessages(dispatch, credentials, folder, messages);

      // Then
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
