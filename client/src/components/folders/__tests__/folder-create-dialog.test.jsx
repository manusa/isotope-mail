import React from 'react';
import {shallow} from 'enzyme/build/index';
import {INITIAL_STATE} from '../../../reducers';
import {ActionTypes} from '../../../actions/action-types';
import {createMockStore} from '../../../__testutils__/store';
import ConnectedFolderCreateDialog, {FolderCreateDialog} from '../folder-create-dialog';
import * as folderService from '../../../services/folder';

const DEFAULT_PROPS = {
  t: jest.fn(messageKey => messageKey),
  application: {
    activeRequests: 0,
    createFolderParentId: ''
  }
};

describe('FolderCreateDialog component test suite', () => {
  describe('Snapshot render', () => {
    test('Defaults, Should render FolderCreateDialog', () => {
      // Given
      const props = DEFAULT_PROPS;

      // When
      const folderCreateDialog = shallow(<FolderCreateDialog {...props} />);

      // Then
      expect(folderCreateDialog).toMatchSnapshot();
    });
  });
  describe('Connect functions', () => {
    test('cancel, dispatch actions triggered', () => {
      // Given
      let dispatchCount = 0;
      const store = createMockStore(INITIAL_STATE);
      store.dispatch = jest.fn(action => {
        if (action.type === ActionTypes.APPLICATION_FOLDER_CREATE) {
          expect(action.payload).toBe(null);
          dispatchCount++;
        }
      });
      const folderCreateDialog = shallow(<ConnectedFolderCreateDialog store={store} {...DEFAULT_PROPS}/>);

      // When
      folderCreateDialog.props().cancel();

      // Then
      expect(dispatchCount).toEqual(1);
    });
    test('createFolder, blank parentFolderId (root), createRootFolder service function called', () => {
      // Given
      const store = createMockStore(INITIAL_STATE);
      store.getState().application.createFolderParentId = '';
      folderService.createRootFolder = jest.fn();
      const folderCreateDialog = shallow(<ConnectedFolderCreateDialog store={store} {...DEFAULT_PROPS}/>);

      // When
      folderCreateDialog.props().createFolder('new-folder');

      // Then
      expect(folderService.createRootFolder).toHaveBeenCalledTimes(1);
    });
    test('createFolder, existent parentFolderId, createChildFolder service function called', () => {
      // Given
      const store = createMockStore(INITIAL_STATE);
      store.getState().application.createFolderParentId = 'parent-folder-id';
      store.getState().folders.explodedItems['parent-folder-id'] = {};
      folderService.createChildFolder = jest.fn();
      const folderCreateDialog = shallow(<ConnectedFolderCreateDialog store={store} {...DEFAULT_PROPS}/>);

      // When
      folderCreateDialog.props().createFolder('new-folder');

      // Then
      expect(folderService.createChildFolder).toHaveBeenCalledTimes(1);
    });
  });
});
