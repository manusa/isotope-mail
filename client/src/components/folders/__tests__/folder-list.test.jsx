import React from 'react';
import {shallow} from 'enzyme';
import {createMockStore, MOCK_STORE} from '../../../__testutils__/store';
import {INITIAL_STATE} from '../../../reducers';
import FolderList from '../folder-list';
import * as folderService from '../../../services/folder';
import * as messageService from '../../../services/message';
import {ActionTypes} from '../../../actions/action-types';

describe('FolderList component test suite', () => {
  test('selectFolder, dispatch actions triggered', () => {
    // Given
    let dispatchCount = 0;
    const store = createMockStore(INITIAL_STATE);
    store.dispatch = jest.fn(action => {
      switch (action.type) {
        case ActionTypes.APPLICATION_FOLDER_SELECT:
        case ActionTypes.APPLICATION_MESSAGE_SELECT:
        case ActionTypes.MESSAGES_CLEAR_SELECTED:
          dispatchCount++;
          break;
        default:
      }
    });
    messageService.resetFolderMessagesCache = jest.fn();
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderList = shallow(<FolderList store={store} {...props}/>);

    // When
    folderList.props().selectFolder({});

    // Then
    expect(dispatchCount).toEqual(3);
    expect(messageService.resetFolderMessagesCache).toHaveBeenCalledTimes(1);
  });
  test('renameFolder, dispatch actions triggered', done => {
    // Given
    const store = createMockStore(INITIAL_STATE);
    store.dispatch = jest.fn(action => {
      if (action.type === ActionTypes.APPLICATION_FOLDER_RENAME) {
        expect(action.payload.folderId).toEqual('1337');
        done();
      }
    });
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderList = shallow(<FolderList store={store} {...props}/>);

    // When
    folderList.props().renameFolder({folderId: '1337'});

    // Then
  });
  test('deleteFolder, dispatch actions triggered', () => {
    // Given
    folderService.deleteFolder = jest.fn();
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderList = shallow(<FolderList store={MOCK_STORE} {...props}/>);

    // When
    folderList.props().deleteFolder({folderId: 'folderToDelete'});

    // Then
    expect(folderService.deleteFolder).toHaveBeenCalledTimes(1);
  });
  test('moveFolder, dispatch actions triggered', () => {
    // Given
    folderService.moveFolder = jest.fn();
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderList = shallow(<FolderList store={MOCK_STORE} {...props}/>);

    // When
    folderList.props().moveFolder({folderId: 'folderToMove'}, {folderId: 'targetFolder'});

    // Then
    expect(folderService.moveFolder).toHaveBeenCalledTimes(1);
  });
  test('moveMessages, service called', () => {
    // Given
    messageService.moveMessages = jest.fn();
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(<FolderList store={MOCK_STORE} {...props}/>);

    // When
    folderContainer.props().moveMessages();

    // Then
    expect(messageService.moveMessages).toHaveBeenCalledTimes(1);
  });
});
