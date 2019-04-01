import React from 'react';
import {shallow} from 'enzyme/build/index';
import {FolderItem} from '../folder-item';

describe('FolderItem component test suite', () => {
  describe('Snapshot render', () => {
    test('Defaults, Should render FolderItem with no menu and no actions', () => {
      // Given
      const props = {
        t: key => key,
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, draggable: true, unreadMessageCount: 13, newMessageCount: 37};

      // When
      const folderItem = shallow(<FolderItem {...props} />);

      // Then
      expect(folderItem).toMatchSnapshot();
    });
    test('Defaults with actions, Should render FolderItem with hidden menu and actions', () => {
      // Given
      const props = {
        t: key => key,
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, draggable: true, unreadMessageCount: 13, newMessageCount: 37,
        onRename: () => {}, onDelete: () => {}};

      // When
      const folderItem = shallow(<FolderItem {...props} />);

      // Then
      expect(folderItem).toMatchSnapshot();
    });
    test('Context Menu Visible, Should render FolderItem with menu', () => {
      // Given
      const props = {
        t: key => key,
        className: 'the-one-percent', graphic: 'Andy Warhol', label: 'Red Label',
        selected: true, draggable: true, unreadMessageCount: 13, newMessageCount: 37,
        onRename: () => {}, onDelete: () => {}};

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
      const onClick = jest.fn();
      const onDragStart = jest.fn();
      const onDrop = jest.fn();
      const folderItem = shallow(<FolderItem label={''} selected={false} draggable={true}
        onClick={onClick} onDragStart={onDragStart} onDrop={onDrop}/>);

      // When
      folderItem.find('.listItem').simulate('click');
      folderItem.find('.listItem').simulate('dragStart', {stopPropagation: () => {}});
      folderItem.find('.listItem').simulate('drop', {preventDefault: () => {}, stopPropagation: () => {}});

      // Then
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onDragStart).toHaveBeenCalledTimes(1);
      expect(onDrop).toHaveBeenCalledTimes(1);
    });
    test('Folder dragged over, should set dragOver true', () => {
      // Given
      const props = {label: 'I\'m NOT dragged over', selected: false};
      const folderItem = shallow(<FolderItem {...props} />);

      // When
      folderItem.find('.listItem').simulate('dragOver', {
        preventDefault: () => {}, stopPropagation: () => {},
        dataTransfer: {types: ['application/hal+json', 'text/plain', 'application/json']}});

      // Then
      expect(folderItem.state('dragOver')).toEqual(true);
    });
    test('Folder drag leave, was dragged over, should set dragOver false', () => {
      // Given
      const props = {label: 'I\'m dragged over', selected: false};
      const folderItem = shallow(<FolderItem {...props} />);
      folderItem.setState({dragOver: true});

      // When
      folderItem.find('.listItem').simulate('dragLeave', {preventDefault: () => {}, stopPropagation: () => {}});

      // Then
      expect(folderItem.state('dragOver')).toEqual(false);
    });
    test('Menu clicked, should show menu', () => {
      // Given
      const props = {
        t: key => key,
        label: 'My menu is hidden', selected: true, onRename: () => {}, onDelete: () => {}};
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
        t: key => key,
        label: 'Menu will hide', selected: true, onRename: () => {}, onDelete: () => {}};
      const folderItem = shallow(<FolderItem {...props} />);
      folderItem.setState({contextMenuVisible: true});

      // When
      folderItem.find('.listItem .actions').simulate('mouseLeave');

      // Then
      expect(folderItem.state('contextMenuVisible')).toEqual(false);
    });
  });
});
