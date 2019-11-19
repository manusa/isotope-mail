import * as folderService from '../folder';
import * as indexedDbService from '../indexed-db';
import {FolderTypes} from '../folder';
import {removeAttributesFromFolders} from '../folder';
import {ActionTypes} from '../../actions/action-types';
import * as fetch from '../fetch';
import * as notification from '../notification';

describe('Folder service test suite', () => {
  describe('processFolders', () => {
    test('no folders, should return null', () => {
      // Given
      const inputFolders = null;
      // When
      const result = folderService.processFolders(inputFolders);
      // Then
      expect(result).toBeNull();
    });
    test('folders with all types of folder, should return processed array', () => {
      // Given
      const inputFolders = [
        {folderId: 'nested_inbox', fullName: 'TRASH/INBOX', name: 'INBOX', type: 'LOST'},
        {folderId: 'inbox', fullName: 'INBOX', name: 'INBOX', type: 'LOST'},
        {folderId: 'trash', fullName: 'Papelera', name: 'Papelera', attributes: ['\\Trash']},
        {folderId: 'brouillon', fullName: 'Brouillon', name: 'Brouillon', attributes: ['\\Drafts']},
        {folderId: 'sent', fullName: 'Sent', name: 'Sent', attributes: ['\\Sent']}
      ];
      // When
      const result = folderService.processFolders(inputFolders);
      // Then
      expect(result).toEqual([
        expect.objectContaining({folderId: 'inbox', fullName: 'INBOX', name: 'INBOX', type: FolderTypes.INBOX}),
        expect.objectContaining({folderId: 'brouillon', name: 'Brouillon', attributes: ['\\Drafts'], type: FolderTypes.DRAFTS}),
        expect.objectContaining({folderId: 'sent', name: 'Sent', attributes: ['\\Sent'], type: FolderTypes.SENT}),
        expect.objectContaining({folderId: 'trash', name: 'Papelera', attributes: ['\\Trash'], type: FolderTypes.TRASH}),
        expect.objectContaining({folderId: 'nested_inbox', fullName: 'TRASH/INBOX', name: 'INBOX', type: FolderTypes.FOLDER})
      ]);
    });
  });
  describe('findTrashFolder', () => {
    test('findTrashFolder, state with TRASH folder, should return trash folder', () => {
      // Given
      const folderState = {explodedItems: [
        {type: FolderTypes.INBOX, folderId: 'inbox'},
        {type: FolderTypes.TRASH, folderId: '1337'}
      ]};

      // When
      const trashFolder = folderService.findTrashFolder(folderState);

      // Then
      expect(trashFolder.folderId).toEqual('1337');
    });
    test('findTrashFolder, state withNO TRASH folder, should return trash folder', () => {
      // Given
      const folderState = {explodedItems: [
        {type: FolderTypes.INBOX, folderId: 'inbox'},
        {type: FolderTypes.FOLDER, folderId: '1337'}
      ]};

      // When
      const trashFolder = folderService.findTrashFolder(folderState);

      // Then
      expect(trashFolder).toBeUndefined();
    });
  });
  describe('removeAttributesFromFolders', () => {
    test('folder array with many attributes, only folder Id and children attributes should remain', () => {
      // Given
      const folderTree = [
        {folderId: 1, attribute: 'something', children: [{folderId: 2, attribute: 'other', children: []}]},
        {folderId: 3, otherAttribute: 'other', children: []}
      ];

      // When
      const result = removeAttributesFromFolders(folderTree);

      // Then
      expect(result[0]).toEqual({folderId: 1, children: [{folderId: 2, children: []}]});
      expect(result[1]).toEqual({folderId: 3, children: []});
    });
  });
  describe('getFolders', () => {
    test('getFolders, loadChildren=true, OK response, should return folders and update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      fetch.refreshCredentials = jest.fn();
      notification.notifyNewMail = jest.fn();
      window.isotopeConfiguration = {_links: {folders: {href: '/folders'}}};
      global.fetch = jest.fn((url, options) => {
        expect(url.search).toBe('?loadChildren=true');
        return Promise.resolve({
          ok: true, url, options, headers: {get: jest.fn()},
          json: () => ([{name: 'INBOX', fullName: 'INBOX', newMessageCount: 1337}])
        });
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.FOLDERS_BE_REQUEST:
            dispatchCount++;
            break;
          case ActionTypes.FOLDERS_SET:
            expect(fetch.refreshCredentials).toHaveBeenCalledTimes(1);
            expect(notification.notifyNewMail).toHaveBeenCalledTimes(1);
            expect(dispatchCount).toEqual(1);
            done();
            break;
          default:
        }
      });

      // When
      folderService.getFolders(dispatch, {credentials: {}}, true);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('moveFolder', () => {
    test('moveFolder, valid folders, OK response, should return target folder with children and update state', done => {
      // Given
      const targetFolder = {folderId: 'dGFyZ2V0'/* btoa('target') */};
      fetch.abortFetch = jest.fn();
      indexedDbService.renameMessageCache = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('dGFyZ2V0');
        return Promise.resolve({ok: true, url, options,
          json: () => ({...targetFolder, fromBackend: true,
            children: [{folderId: 'dGFyZ2V0LjEzMzc='/* btoa('target.1337') */,
              previousFolderId: 'MTMzNw=='/* btoa('1337') */}]})});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.APPLICATION_FOLDER_RENAME_OK:
            dispatchCount++;
            break;
          case ActionTypes.FOLDERS_UPDATE:
            dispatchCount++;
            expect(action.payload.fromBackend).toEqual(true);
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(3);
            expect(indexedDbService.renameMessageCache).toHaveBeenCalledTimes(1);
            done();
            break;
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.move':
            {href: 'http://test.url/api/v1/folders/{folderId}/parent'}}};
      const folder = {
        folderId: 'Zm9sZGVyLjEzMzc=',
        type: FolderTypes.FOLDER
      };

      // When
      folderService.moveFolder(dispatch, {credentials: {}}, folder, targetFolder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('moveFolder, valid folder null target -> move to first level, OK response,' +
      'should return default/root folder with children and set all folders in state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      indexedDbService.renameMessageCache = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toBeNull();
        return Promise.resolve({ok: true, url, options,
          json: () => ({fromBackend: true,
            children: [{folderId: 'MTMzNw=='/* btoa('1337') */,
              previousFolderId: 'Zm9sZGVyLjEzMzc='/* btoa('folder.1337') */}]})});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.APPLICATION_FOLDER_RENAME_OK:
            dispatchCount++;
            break;
          case ActionTypes.FOLDERS_SET:
            dispatchCount++;
            expect(action.payload.length).toEqual(1);
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(3);
            expect(indexedDbService.renameMessageCache).toHaveBeenCalledTimes(1);
            done();
            break;
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.move':
            {href: 'http://test.url/api/v1/folders/{folderId}/parent'}}};
      const folder = {
        folderId: 'Zm9sZGVyLjEzMzc=',
        type: FolderTypes.FOLDER
      };

      // When
      folderService.moveFolder(dispatch, {credentials: {}}, folder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('moveFolder, valid folders, NOT OK response, should complete and not update state', done => {
      // Given
      const targetFolder = {folderId: 'targetFolderId'};
      fetch.abortFetch = jest.fn();
      indexedDbService.renameMessageCache = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('targetFolderId');
        return Promise.resolve({ok: false, url, options, json: () => targetFolder});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        dispatchCount++;
        if (action.type === ActionTypes.APPLICATION_BE_REQUEST_COMPLETED) {
          expect(dispatchCount).toEqual(2);
          expect(indexedDbService.renameMessageCache).toHaveBeenCalledTimes(0);
          done();
        }
      });
      window.isotopeConfiguration = {_links: {'folders.move':
            {href: 'http://test.url/api/v1/folders/{folderId}/parent'}}};
      const folder = {
        folderId: 'Zm9sZGVyLjEzMzc=',
        type: FolderTypes.FOLDER
      };

      // When
      folderService.moveFolder(dispatch, {credentials: {}}, folder, targetFolder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('deleteFolder', () => {
    test('deleteFolder, valid folder, OK response, should return parent folder with children and update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      indexedDbService.deleteMessageCache = jest.fn((userId, hash, foldersToDeleteIds) => {
        expect(userId).toEqual('id');
        expect(hash).toEqual('hash');
        expect(foldersToDeleteIds).toEqual(expect.arrayContaining(['parent', 'child1', 'child2', 'child3']));
      });

      global.fetch = jest.fn((url, options) => Promise.resolve(
        {ok: true, url, options, json: () => ({fromBackend: true})}));
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
            dispatchCount++;
            break;
          case ActionTypes.FOLDERS_UPDATE:
            dispatchCount++;
            expect(action.payload.fromBackend).toEqual(true);
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(2);
            expect(indexedDbService.deleteMessageCache).toHaveBeenCalledTimes(1);
            done();
            break;
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.delete': {href: 'http://test.url/api/v1/folders/{folderId}'}}};
      const folder = {
        type: FolderTypes.FOLDER,
        folderId: 'parent',
        children: [{folderId: 'child1', children: []}, {folderId: 'child2'}, {folderId: 'child3'}]
      };

      // When
      folderService.deleteFolder(dispatch, {credentials: {}, id: 'id', hash: 'hash'}, folder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('deleteFolder, valid folder, NOT OK response, should complete and not update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      indexedDbService.deleteMessageCache = jest.fn();
      global.fetch = jest.fn((url, options) => Promise.resolve({ok: false, url, options}));
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        dispatchCount++;
        if (action.type === ActionTypes.APPLICATION_BE_REQUEST_COMPLETED) {
          expect(dispatchCount).toEqual(2);
          expect(indexedDbService.deleteMessageCache).toHaveBeenCalledTimes(0);
          done();
        }
      });
      window.isotopeConfiguration = {_links: {'folders.delete': {href: 'http://test.url/api/v1/folders/{folderId}'}}};
      const folder = {
        folderId: '1337',
        type: FolderTypes.FOLDER
      };

      // When
      folderService.deleteFolder(dispatch, {credentials: {}}, folder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('createRootFolder', () => {
    test('createRootFolder, valid newName, OK response, should return list of root folders and update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      window.isotopeConfiguration = {_links: {folders: {href: '/folders'}}};
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('Alex\'s new folder');
        return Promise.resolve({ok: true, url, options,
          json: () => ([])});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.FOLDERS_SET:
          case ActionTypes.APPLICATION_FOLDER_CREATE:
            dispatchCount++;
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(3);
            done();
            break;
          default:
        }
      });

      // When
      folderService.createRootFolder(dispatch, {credentials: {}}, 'Alex\'s new folder');

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('createRootFolder, valid newName, NOT OK response, should complete and not update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      window.isotopeConfiguration = {_links: {folders: {href: '/folders'}}};
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('new-folder-name');
        return Promise.resolve({ok: false, url, options});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.FOLDERS_SET:
          case ActionTypes.APPLICATION_FOLDER_CREATE:
            dispatchCount++;
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(1);
            done();
            break;
          default:
        }
      });

      // When
      folderService.createRootFolder(dispatch, {credentials: {}}, 'new-folder-name');

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('createChildFolder', () => {
    test('createChildFolder, valid parent and newName, OK response, should return updated parent folder and update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('Aitana\'s new folder');
        return Promise.resolve({ok: true, url, options,
          json: () => ([])});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.FOLDERS_UPDATE:
          case ActionTypes.APPLICATION_FOLDER_CREATE:
            dispatchCount++;
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(3);
            done();
            break;
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.self': {href: '://url/parent'}}};

      // When
      folderService.createChildFolder(dispatch, {credentials: {}}, {}, 'Aitana\'s new folder');

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('createChildFolder, valid parent and newName, NOT OK response, should complete and not update state', done => {
      // Given
      fetch.abortFetch = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('new-folder-name');
        return Promise.resolve({ok: false, url, options});
      });
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.FOLDERS_UPDATE:
          case ActionTypes.APPLICATION_FOLDER_CREATE:
            dispatchCount++;
            break;
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
            expect(dispatchCount).toEqual(1);
            done();
            break;
          default:
        }
      });
      window.isotopeConfiguration = {_links: {'folders.self': {href: '://url/parent'}}};

      // When
      folderService.createChildFolder(dispatch, {credentials: {}}, {}, 'new-folder-name');

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
