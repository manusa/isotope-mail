import React from 'react';
import {shallow} from 'enzyme/build/index';
import {MOCK_STORE} from '../../../__testutils__/store';
import * as messageService from '../../../services/message';
import * as applicationActions from '../../../actions/application';
import * as messageActions from '../../../actions/messages';
import ConnectedFolderContainer, {FolderContainer} from '../folder-container';

describe('FolderContainer component test suite', () => {
  test('Snapshot render, should render FolderContainer', () => {
    const {activeRequests, folderList, selectedFolder} = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <FolderContainer activeRequests={activeRequests} folderList={folderList}
        selectedFolder={selectedFolder}/>);
    expect(folderContainer).toMatchSnapshot();
  });
  test('selectFolder, dispatch actions triggered', () => {
    // Given
    const mockAction = {type: 'MOCK', action: 'MOCK'}
    applicationActions.selectFolder = jest.fn(() => (mockAction));
    applicationActions.selectMessage = jest.fn(() => (mockAction));
    messageActions.clearSelected = jest.fn(() => (mockAction));
    messageService.resetFolderMessagesCache = jest.fn();
    const {activeRequests, folderList, selectedFolder} = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <ConnectedFolderContainer store={MOCK_STORE} activeRequests={activeRequests} folderList={folderList}
        selectedFolder={selectedFolder}/>);

    // When
    folderContainer.props().selectFolder({});

    // Then
    expect(applicationActions.selectFolder).toHaveBeenCalledTimes(1);
    expect(applicationActions.selectMessage).toHaveBeenCalledTimes(1);
    expect(messageActions.clearSelected).toHaveBeenCalledTimes(1);
    expect(messageService.resetFolderMessagesCache).toHaveBeenCalledTimes(1);
  });
  test('moveMessages, service called', () => {
    // Given
    messageService.moveMessages = jest.fn();
    const {activeRequests, folderList, selectedFolder} = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <ConnectedFolderContainer store={MOCK_STORE} activeRequests={activeRequests} folderList={folderList}
        selectedFolder={selectedFolder}/>);

    // When
    folderContainer.props().moveMessages();

    // Then
    expect(messageService.moveMessages).toHaveBeenCalledTimes(1);
  });
});
