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
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337', type: FolderTypes.INBOX};

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
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337'};

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
          case ActionTypes.FOLDERS_UPDATE:
          case ActionTypes.FOLDERS_UPDATE_PROPERTIES:
          case ActionTypes.MESSAGES_LOCK_ADD: {
            dispatchCount++;
            break;
          }
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.message.seen.bulk':
            {href: 'http://test.url/{folderId}/messages/seen/{seen}'}}};
      const folder = {folderId: 'folder1337'};
      const messages = [
        {uid: 1},
        {uid: 1337}
      ];

      // When
      messageService.setMessagesSeen(dispatch, {}, folder, messages, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(3);
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
        switch (action.type) {
          case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST:
          case ActionTypes.MESSAGES_LOCK_ADD: {
            dispatchCount++;
            break;
          }
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.message.flagged':
            {href: 'http://test.url/{folderId}/messages/{messageId}/flagged'}}};
      const folder = {folderId: 'folder1337'};
      const message = {uid: 1};

      // When
      messageService.setMessageFlagged(dispatch, {}, folder, message, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatchCount).toEqual(2);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('deleteAllFolderMessages', () => {
    test('deleteAllFolderMessages with valid folder, should fetch and dispatch results', done => {
      // Given
      global.fetch = jest.fn((url, options) => Promise.resolve(
        {ok: true, url, options, json: () => Promise.resolve({fromServer: true})})
      );
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.FOLDERS_UPDATE:
          case ActionTypes.MESSAGES_SET_FOLDER_CACHE: {
            dispatchCount++;
            break;
          }
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED: {
            expect(dispatchCount).toEqual(3);
            done();
            break;
          }
          default:
        }
      });
      const credentials = {};
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337'};
      // When
      messageService.deleteAllFolderMessages(dispatch, credentials, folder);
      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('deleteAllFolderMessages with valid folder, fetch error, should abort and do nothing', done => {
      // Given
      global.fetch = jest.fn(() => Promise.resolve({ok: true}));
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        dispatchCount++;
        if (action.type === ActionTypes.APPLICATION_BE_REQUEST_COMPLETED) {
          expect(dispatchCount).toEqual(2);
          done();
        }
      });
      const credentials = {};
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337'};
      // When
      messageService.deleteAllFolderMessages(dispatch, credentials, folder);
      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('deleteMessages', () => {
    test('deleteMessages with valid message array, should fetch and dispatch results', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/api/v1/folders/1337/messages?id=1&id=1337');
        return Promise.resolve({ok: true, url, options, json: () => Promise.resolve({fromServer: true})});
      });
      fetch.abortFetch = jest.fn();
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.MESSAGES_UPDATE_CACHE_IF_EXIST:
          case ActionTypes.MESSAGES_SET_SELECTED:
          case ActionTypes.FOLDERS_UPDATE:
          case ActionTypes.FOLDERS_UPDATE_PROPERTIES:
          case ActionTypes.MESSAGES_LOCK_ADD:
          case ActionTypes.MESSAGES_LOCK_REMOVE: {
            dispatchCount++;
            break;
          }
          case ActionTypes.MESSAGES_DELETE_FROM_CACHE: {
            expect(dispatchCount).toEqual(6);
            expect(action.payload.folder.fromServer).toEqual(true);
            done();
            break;
          }
          default:
        }
      });
      const credentials = {};
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337'};
      const messages = [{uid: 1}, {uid: 1337}];

      // When
      messageService.deleteMessages(dispatch, credentials, folder, messages);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('deleteMessages with valid message array, fetch has error, should dispatch previous folder/messages', done => {
      // Given
      global.fetch = jest.fn(url => {
        expect(url.toLocaleString()).toMatch('http://test.url.with.error/api/v1/folders/1337/messages?id=1&id=1337');
        return Promise.resolve({ok: true});
      });
      fetch.abortFetch = jest.fn();
      const dispatch = jest.fn(action => {
        if (action && action.type === ActionTypes.FOLDERS_UPDATE_PROPERTIES) {
          expect(action.payload.originalFolder).toEqual(true);
          done();
        }
      });
      window.isotopeConfiguration = {_links: {'folders.messages':
            {href: 'http://test.url.with.error/api/v1/folders/{folderId}/messages'}}};
      const folder = {folderId: '1337', originalFolder: true};
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
  describe('downloadMessage', () => {
    test('valid arguments, fetch OK, should perform ajax download', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/api/v1/folders/313373/messages/1337');
        expect(options.headers.Accept).toBe('message/rfc822');
        return Promise.resolve({ok: true, blob: jest.fn(() => new Blob([''], {type: 'message/rfc822'})),
          headers: {get: jest.fn(() => 'attachment; filename=1337.eml')}
        });
      });
      global.URL = {
        createObjectURL: jest.fn(blob => {
          expect(blob.type).toBe('message/rfc822');
        }),
        revokeObjectURL: jest.fn(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
          done();
        })
      };
      window.isotopeConfiguration = {_links: {'folders.message':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages/{messageId}'}}};
      const folder = {folderId: '313373'};
      const message = {uid: 1337};

      // When
      messageService.downloadMessage({}, folder, message);

      // Then
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('valid arguments, fetch OK, navigator.msSaveBlob, should perform msSaveBlob', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url.toLocaleString()).toMatch('http://test.url/api/v1/folders/313373/messages/1337');
        expect(options.headers.Accept).toBe('message/rfc822');
        return Promise.resolve({ok: true, blob: jest.fn(() => new Blob([''], {type: 'message/rfc822'})),
          headers: {get: jest.fn(() => 'attachment; filename=1337.eml')}
        });
      });
      navigator.msSaveBlob = jest.fn((blob, fileName) => {
        expect(blob.type).toBe('message/rfc822');
        expect(fileName).toBe('1337.eml');
        done();
      });
      window.isotopeConfiguration = {_links: {'folders.message':
            {href: 'http://test.url/api/v1/folders/{folderId}/messages/{messageId}'}}};
      const folder = {folderId: '313373'};
      const message = {uid: 1337};

      // When
      messageService.downloadMessage({}, folder, message);

      // Then
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
