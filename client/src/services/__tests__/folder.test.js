import * as folderService from '../folder';
import * as indexedDbService from '../indexed-db';
import {FolderTypes} from '../folder';
import {ActionTypes} from '../../actions/action-types';
import * as fetch from '../fetch';

describe('Folder service test suite', () => {
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
  describe('moveFolder', () => {
    test('moveFolder, valid folders, OK response, should return target folder with children and update state', done => {
      // Given
      const targetFolder = {folderId: 'targetFolderId'};
      fetch.abortFetch = jest.fn();
      indexedDbService.renameMessageCache = jest.fn();
      global.fetch = jest.fn((url, options) => {
        expect(options.body).toMatch('targetFolderId');
        return Promise.resolve({ok: true, url, options,
          json: () => ({...targetFolder, fromBackend: true, children: [{previousFolderId: '1337'}]})});
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
      const folder = {
        type: FolderTypes.FOLDER,
        _links: {move: {href: 'http://test.url/api/v1/folders/1337/parent'}}
      };

      // When
      folderService.moveFolder(dispatch, {credentials: {}}, folder, targetFolder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    test('moveFolder, valid folders, NOT OK response, should complete and not update stete', done => {
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
      const folder = {
        type: FolderTypes.FOLDER,
        _links: {move: {href: 'http://test.url/api/v1/folders/1337/parent'}}
      };

      // When
      folderService.moveFolder(dispatch, {credentials: {}}, folder, targetFolder);

      // Then
      expect(fetch.abortFetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
