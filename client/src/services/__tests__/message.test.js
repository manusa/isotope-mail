import * as messageService from '../message';
import * as fetch from '../fetch';
import {ActionTypes} from '../../actions/action-types';

describe('Message service test suite', () => {
  // Backup mocked implementations
  beforeEach(() => {
    global.fetchBu = global.fetch;
  });
  // Restore mocked implementations
  afterEach(() => {
    global.fetch = global.fetchBu;
  });
  describe('setMessagesSeen', () => {
    test('setMessagesSeen with valid message array, should dispatch results and fetch (update BE)', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/folder1337?seen=true');
        expect(options.body).toMatch('[1,1337]');
        return Promise.resolve({ok: true, url, options, json: () => {
          done();
          return Promise.resolve({});
        }});
      });
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.MESSAGES_UPDATE_CACHE:
          case ActionTypes.FOLDERS_UPDATE: {
            dispatchCount++;
            break;
          }
          default:
        }
      });
      const credentials = {};
      const folder = {};
      const messages = [
        {uid: 1, _links: {'seen.bulk': {href: 'http://test.url/folder1337?seen={seen}'}}},
        {uid: 1337}
      ];

      // When
      messageService.setMessagesSeen(dispatch, credentials, folder, messages, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('deleteMessages', () => {
    test('deleteMessages with valid message array, should fetch and dispatch results', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/?id=1&id=1337');
        return Promise.resolve({ok: true, url, options, json: () => Promise.resolve({fromServer: true})});
      });
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.MESSAGES_DELETE_FROM_CACHE:
          case ActionTypes.MESSAGES_SET_SELECTED: {
            dispatchCount++;
            break;
          }
          case ActionTypes.FOLDERS_UPDATE: {
            expect(action.payload.fromServer).toEqual(true);
            done();
            break;
          }
          default:
        }
      });
      const credentials = {};
      const folder = {_links: {messages: {href: 'http://test.url'}}};
      const messages = [{uid: 1}, {uid: 1337}];

      // When
      messageService.deleteMessages(dispatch, credentials, folder, messages);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('deleteMessages with valid message array, fetch has error, should dispatch previous folder/messages', done => {
      // Given
      global.fetch = jest.fn(url => {
        expect(url.toLocaleString()).toMatch('http://test.url.witherror/?id=1&id=1337');
        return Promise.resolve({ok: true});
      });
      fetch.abortFetch = jest.fn();
      const dispatch = jest.fn(action => {
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
