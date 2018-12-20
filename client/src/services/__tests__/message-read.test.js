import * as fetch from '../fetch';
import * as messageService from '../message';
import * as messageReadService from '../message-read';
import {ActionTypes} from '../../actions/action-types';

describe('MessageRead service test suite', () => {
  // Backup mocked implementations
  beforeEach(() => {
    global.fetchBu = global.fetch;
  });
  // Restore mocked implementations
  afterEach(() => {
    global.fetch = global.fetchBu;
  });
  describe('readMessage', () => {
    test('readMessage, not downloaded/cached message, should read message from BE', done => {
      // Given
      messageService.closeResetFolderMessagesCacheEventSource = jest.fn();
      fetch.abortFetch = jest.fn();
      const dispatch = jest.fn(action => {
        if (action.type === ActionTypes.APPLICATION_MESSAGE_REFRESH) {
          const {message, folder} = action.payload;
          expect(folder.unreadMessageCount).toEqual(1337);
          expect(message.fromBackend).toEqual(true);
          expect(message.folder.unreadMessageCount).toEqual(1337);
          expect(message.seen).toEqual(true);
        } else if (action.type === ActionTypes.APPLICATION_MESSAGE_REPLACE_IMAGE) {
          done();
        }
      });
      const credentials = {};
      const downloadedMessages = {};
      const folder = {
        unreadMessageCount: 1338
      };
      const message = {
        messageId: '1337@1337-server.com',
        folder,
        seen: false,
        content: '<img src="cid:attachment1.png" />',
        attachments: [
          {contentId: '<attachment1.png>', contentType: 'image/png',
            _links: {download: {href: 'http://test.com/folderId/messageId/attachments/1'}}}
        ],
        _links: {
          self: {href: 'http://test.com/folderId/messageId'},
          seen: {href: 'http://test.com/folderId/messageId/seen'}
        }
      };
      global.fetch = jest.fn((url, options) =>
        Promise.resolve({ok: true, url, options,
          json: () => ({...message, fromBackend: true}),
          blob: () => Promise.resolve({})})
      );

      // When
      messageReadService.readMessage(dispatch, credentials, downloadedMessages, folder, message);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(2);
      expect(messageService.closeResetFolderMessagesCacheEventSource).toHaveBeenCalledTimes(1);
    });
  });
});
