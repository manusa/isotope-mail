import React from 'react';
import {shallow} from 'enzyme/build/index';
import {INITIAL_STATE} from '../../../reducers';
import {ActionTypes} from '../../../actions/action-types';
import {createMockStore} from '../../../__testutils__/store';
import ConnectedFolderRenameDialog, {FolderRenameDialog} from '../folder-rename-dialog';
import * as folderService from '../../../services/folder';

const DEFAULT_PROPS = {
  t: jest.fn(messageKey => messageKey),
  folderToRename: {
    name: 'Name of the renamed Folder'
  },
  application: {
    activeRequests: 0,
    createFolderParentId: ''
  }
};

describe('FolderRenameDialog component test suite', () => {
  describe('Snapshot render', () => {
    test('Defaults, Should render FolderRenameDialog', () => {
      // Given
      const props = {...DEFAULT_PROPS,
        cancelAction: jest.fn(),
        renameFolder: jest.fn()
      };

      // When
      const folderRenameDialog = shallow(<FolderRenameDialog {...props} />);

      // Then
      expect(folderRenameDialog).toMatchSnapshot();
    });
  });
  describe('Render inner functions', () => {
    test('inner function renameFolderAction, should be defined and trigger renameFolder function', () => {
      // Given
      const props = {...DEFAULT_PROPS,
        folderToRename: null,
        cancelAction: jest.fn(),
        renameFolder: jest.fn()
      };
      const folderRenameDialog = shallow(<FolderRenameDialog {...props} />);

      // When
      folderRenameDialog.props().okAction('new Name');

      // Then
      expect(props.renameFolder).toHaveBeenCalledTimes(1);
    });
  });
  describe('Connect functions', () => {
    test('cancel, dispatch actions triggered', () => {
      // Given
      let dispatchCount = 0;
      const store = createMockStore(INITIAL_STATE);
      store.dispatch = jest.fn(action => {
        if (action.type === ActionTypes.APPLICATION_FOLDER_RENAME) {
          expect(action.payload).toBe(null);
          dispatchCount++;
        }
      });
      const folderRenameDialog = shallow(<ConnectedFolderRenameDialog store={store} {...DEFAULT_PROPS}/>);

      // When
      folderRenameDialog.props().cancel();

      // Then
      expect(dispatchCount).toEqual(1);
    });
    test('renameFolder, service function called', () => {
      // Given
      const store = createMockStore(INITIAL_STATE);
      folderService.renameFolder = jest.fn();
      const folderRenameDialog = shallow(<ConnectedFolderRenameDialog store={store} {...DEFAULT_PROPS}/>);

      // When
      folderRenameDialog.props().renameFolder({name: 'folder-to-rename'}, 'new-folder-name');

      // Then
      expect(folderService.renameFolder).toHaveBeenCalledTimes(1);
    });
  });
});
