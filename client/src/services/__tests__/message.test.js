import * as messageService from '../message';
import * as fodlerActions from '../../actions/folders';
import * as messageActions from '../../actions/messages';
import * as fetch from '../fetch';
import {ActionTypes} from '../../actions/action-types';

describe('Message service test suite', () => {
  // Backup mocked implementations
  beforeEach(() => {
    global.fetchBu = global.fetch;
    messageActions.deleteFromCacheBu = messageActions.deleteFromCache;
    messageActions.setSelectedBu = messageActions.setSelected;
    messageActions.updateCacheBu = messageActions.updateCache;
    fodlerActions.updateFolderBu = fodlerActions.updateFolder;
  });
  // Restore mocked implementations
  afterEach(() => {
    global.fetch = global.fetchBu;
    messageActions.deleteFromCache = messageActions.deleteFromCacheBu;
    messageActions.setSelected = messageActions.setSelectedBu;
    messageActions.updateCache = messageActions.updateCacheBu;
    fodlerActions.updateFolder = fodlerActions.updateFolderBu;
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
      messageActions.updateCache = jest.fn();
      fodlerActions.updateFolder = jest.fn();
      const dispatch = jest.fn();
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
      expect(messageActions.updateCache).toHaveBeenCalledTimes(1);
      expect(fodlerActions.updateFolder).toHaveBeenCalledTimes(1);
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
