import React from 'react';
import {shallow} from 'enzyme/build/index';
import FolderItem from '../folder-item';

describe('FolderItem component test suite', () => {
  describe('Snapshot render', () => {
    test('Defaults, Should render FolderItem with no menu and no actions', () => {
      // Given
      const props = {
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, unreadMessageCount: 13, newMessageCount: 37};

      // When
      const folderItem = shallow(<FolderItem {...props} />);

      // Then
      expect(folderItem).toMatchSnapshot();
    });
    test('Defaults with actions, Should render FolderItem with hidden menu and actions', () => {
      // Given
      const props = {
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, unreadMessageCount: 13, newMessageCount: 37, onRename: () => {}, onDelete: () => {}};

      // When
      const folderItem = shallow(<FolderItem {...props} />);

      // Then
      expect(folderItem).toMatchSnapshot();
    });
    test('Context Menu Visible, Should render FolderItem with menu', () => {
      // Given
      const props = {
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, unreadMessageCount: 13, newMessageCount: 37, onRename: () => {}, onDelete: () => {}};

      // When
      const folderItem = shallow(<FolderItem {...props} />);
      folderItem.setState({contextMenuVisible: true});

      // Then
      expect(folderItem).toMatchSnapshot();
    });
  });
  describe('Component events', () => {
    test('Generic mouse events, events fired', () => {
      // Given
      const onDrop = jest.fn();
      const onClick = jest.fn();
      const folderItem = shallow(<FolderItem label={''} selected={false} onDrop={onDrop} onClick={onClick}/>);

      // When
      folderItem.find('.listItem').simulate('drop', {preventDefault: () => {}});
      folderItem.find('.listItem').simulate('dragOver', {
        preventDefault: () => {}, dataTransfer: {types: ['application/hal+json', 'text/plain', 'application/json']}});
      folderItem.find('.listItem').simulate('click');

      // Then
      expect(onDrop).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    test('Menu clicked, should show menu', () => {
      // Given
      const props = {
        selected: true, onRename: () => {}, onDelete: () => {}};
      const folderItem = shallow(<FolderItem {...props} />);

      // When
      folderItem.find('.listItem .actions').find({children: 'more_vert'})
        .simulate('click', {preventDefault: () => {}, stopPropagation: () => {}});

      // Then
      expect(folderItem.state('contextMenuVisible')).toEqual(true);
    });
    test('Mouse Leave, menu visible, should hide menu', () => {
      // Given
      const props = {
        label: 'Menu will hide', selected: true, onRename: () => {}, onDelete: () => {}};
      const folderItem = shallow(<FolderItem {...props} />);
      folderItem.setState({contextMenuVisible: true});

      // When
      folderItem.find('.listItem').simulate('mouseLeave');

      // Then
      expect(folderItem.state('contextMenuVisible')).toEqual(false);
    });
  });
});
