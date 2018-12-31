import React from 'react';
import {shallow} from 'enzyme';
import * as messageService from '../../../services/message';
import {MOCK_STORE} from '../../../__testutils__/store';
import * as messageActions from '../../../actions/messages';
import * as applicationActions from '../../../actions/application';
import FolderList from '../folder-list';

describe('FolderList component test suite', () => {

  test('selectFolder, dispatch actions triggered', () => {
    // Given
    const mockAction = {type: 'MOCK', action: 'MOCK'}
    applicationActions.selectFolder = jest.fn(() => (mockAction));
    applicationActions.selectMessage = jest.fn(() => (mockAction));
    messageActions.clearSelected = jest.fn(() => (mockAction));
    messageService.resetFolderMessagesCache = jest.fn();
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <FolderList store={MOCK_STORE} {...props}/>);

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
    const props = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <FolderList store={MOCK_STORE} {...props}/>);

    // When
    folderContainer.props().moveMessages();

    // Then
    expect(messageService.moveMessages).toHaveBeenCalledTimes(1);
  });
});
