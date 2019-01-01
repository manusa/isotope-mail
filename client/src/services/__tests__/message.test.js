import * as messageService from '../message';
import * as fetch from '../fetch';
import * as notification from '../notification';
import {ActionTypes} from '../../actions/action-types';
import {FolderTypes} from '../folder';

describe('Message service test suite', () => {
  // Backup mocked implementations
  beforeEach(() => {
    global.fetchBu = global.fetch;
  });
  // Restore mocked implementations
  afterEach(() => {
    global.fetch = global.fetchBu;
  });
  describe('preloadMessages', () => {
    test('preloadMessages, INBOX folder, should return recent message and trigger notification', done => {
      // Given
      global.fetch = jest.fn(url => {
        expect(url.toLocaleString()).toMatch('http://test.url/api/v1/folders/1337/messages?id=1337&id=1338');
        return Promise.resolve({ok: true, json: () => [{recent: true}]});
      });
      notification.notifyNewMail = jest.fn();
      const dispatch = jest.fn(action => {
        if (action.type === ActionTypes.APPLICATION_MESSAGE_PRE_DOWNLOAD) {
          expect(notification.notifyNewMail).toHaveBeenCalledTimes(1);
          done();
        }
      });
      const folder = {
        type: FolderTypes.INBOX,
        _links: {messages: {href: 'http://test.url/api/v1/folders/1337/messages'}}
      };

      // When
      messageService.preloadMessages(dispatch, {}, folder, [1337, 1338]);

      // Then
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('preloadMessages, NOT INBOX folder, should return recent message and NOT trigger notification', done => {
      // Given
      global.fetch = jest.fn(url => {
        expect(url.toLocaleString()).toMatch('http://test.url/api/v1/folders/1337/messages?id=1337&id=1338');
        return Promise.resolve({ok: true, json: () => [{recent: true}]});
      });
      notification.notifyNewMail = jest.fn();
      const dispatch = jest.fn(action => {
        if (action.type === ActionTypes.APPLICATION_MESSAGE_PRE_DOWNLOAD) {
          expect(notification.notifyNewMail).toHaveBeenCalledTimes(0);
          done();
        }
      });
      const folder = {
        type: FolderTypes.FOLDER,
        _links: {messages: {href: 'http://test.url/api/v1/folders/1337/messages'}}
      };

      // When
      messageService.preloadMessages(dispatch, {}, folder, [1337, 1338]);

      // Then
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('setMessagesSeen', () => {
    test('setMessagesSeen with valid message array, should dispatch results and fetch (update BE)', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/folder1337/messages/seen/true');
        expect(options.body).toMatch('[1,1337]');
        done();
        return Promise.resolve({});
      });
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST:
          case ActionTypes.FOLDERS_UPDATE: {
            dispatchCount++;
            break;
          }
          default:
        }
      });
      const folder = {_links: {'message.seen.bulk': {href: 'http://test.url/folder1337/messages/seen/{seen}'}}};
      const messages = [
        {uid: 1},
        {uid: 1337}
      ];

      // When
      messageService.setMessagesSeen(dispatch, {}, folder, messages, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('setMessageFlagged', () => {
    test('setMessageFlagged with valid message, should dispatch result and fetch (update BE)', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/folder1337/messages/1/flagged');
        expect(options.body).toMatch('true');
        done();
        return Promise.resolve({});
      });
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        if (action.type === ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST) {
          dispatchCount++;
        }
      });
      const folder = {_links: {'message.flagged': {href: 'http://test.url/folder1337/messages/{messageId}/flagged'}}};
      const message = {uid: 1};

      // When
      messageService.setMessageFlagged(dispatch, {}, folder, message, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(1);
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
          case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST:
          case ActionTypes.MESSAGES_SET_SELECTED:
          case ActionTypes.FOLDERS_UPDATE: {
            dispatchCount++;
            break;
          }
          case ActionTypes.MESSAGES_DELETE_FROM_CACHE: {
            expect(action.payload.folder.fromServer).toEqual(true);
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
      expect(dispatchCount).toEqual(3);
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
      const folder = {_links: {messages: {href: 'http://test.url.witherror'}}, originalFolder: true};
      const messages = [{uid: 1}, {uid: 1337}];

      // When
      messageService.deleteMessages(dispatch, {}, folder, messages);

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
