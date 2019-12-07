import React from 'react';
import {shallow} from 'enzyme/build/index';
import {MOCK_STORE} from '../../../__testutils__/store';
import ConnectedClearFolderListItem, {ClearFolderListItem} from '../clear-folder-list-item';
import {FolderTypes} from '../../../services/folder';
import * as messageService from '../../../services/message';

describe('ClearFolderListItem component test suite', () => {
  describe('Snapshot render', () => {
    test('Selected folder NOT trash nor junk, should not render', () => {
      // Given
      const props = {
        selectedFolder: {}
      };
      // When
      const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
      // Then
      expect(clearFolderListItem).toMatchSnapshot();
    });
    test('Selected folder is trash, should render', () => {
      // Given
      const props = {
        t: key => key,
        selectedFolder: {type: FolderTypes.TRASH}
      };
      // When
      const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
      // Then
      expect(clearFolderListItem).toMatchSnapshot();
    });
  });
  test('Selected folder is junk, should render', () => {
    // Given
    const props = {
      t: key => key,
      selectedFolder: {type: FolderTypes.JUNK}
    };
    // When
    const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
    // Then
    expect(clearFolderListItem).toMatchSnapshot();
  });
  describe('nested component functions', () => {
    test('Button.onclick, should set dialog visible', () => {
      // Given
      const props = {
        t: key => key,
        selectedFolder: {type: FolderTypes.TRASH}
      };
      const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
      // When
      clearFolderListItem.find('Button').props().onClick();
      // Then
      expect(clearFolderListItem.find('Translate(ConfirmClearFolderDialog)').props().visible).toBe(true);
    });
    test('ConfirmClearFolderDialog.cancelAction, should set dialog not visible', () => {
      // Given
      const props = {
        t: key => key,
        selectedFolder: {type: FolderTypes.TRASH}
      };
      const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
      clearFolderListItem.find('Button').props().onClick();
      // When
      clearFolderListItem.find('Translate(ConfirmClearFolderDialog)').props().cancelAction();
      // Then
      expect(clearFolderListItem.find('Translate(ConfirmClearFolderDialog)').props().visible).toBe(false);
    });
    test('ConfirmClearFolderDialog.clearFolder, should trigger function', () => {
      // Given
      const props = {
        t: key => key,
        selectedFolder: {type: FolderTypes.TRASH},
        clearFolder: jest.fn()
      };
      const clearFolderListItem = shallow(<ClearFolderListItem {...props} />);
      // When
      clearFolderListItem.find('Translate(ConfirmClearFolderDialog)').props().deleteAction();
      // Then
      expect(props.clearFolder).toHaveBeenCalledTimes(1);
    });
  });
  describe('Connect functions', () => {
    test('clearFolder, dispatch actions triggered', () => {
      const props = {
        store: MOCK_STORE,
        selectedFolder: {}
      };
      messageService.deleteAllFolderMessages = jest.fn();
      const clearFolderListItem = shallow(<ConnectedClearFolderListItem {...props} />);
      // When
      clearFolderListItem.props().clearFolder();
      // Then
      expect(messageService.deleteAllFolderMessages).toHaveBeenCalledTimes(1);
    });
  });
});
