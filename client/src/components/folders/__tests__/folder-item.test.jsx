import React from 'react';
import {shallow} from 'enzyme/build/index';
import FolderItem from '../folder-item';

describe('FolderItem component test suite', () => {
  test('Snapshot render, should render FolderItem', () => {
    const {graphic, label, selected, unreadMessageCount, newMessageCount} = {
      graphic: 'Andy Warhol', label: 'Red Label', selected: true, unreadMessageCount: 13, newMessageCount: 37};
    const folderItem = shallow(<FolderItem graphic={graphic} label={label} selected={selected}
      unreadMessageCount={unreadMessageCount} newMessageCount={newMessageCount}/>);
    expect(folderItem).toMatchSnapshot();
  });
  test('component events, events fired', () => {
    // Given
    const onDrop = jest.fn();
    const onClick = jest.fn();
    const folderItem = shallow(<FolderItem label={''} selected={false} onDrop={onDrop} onClick={onClick}/>);

    // When
    folderItem.find('.listItem').simulate('drop');
    folderItem.find('.listItem').simulate('dragOver', {preventDefault: () => {}});
    folderItem.find('.listItem').simulate('click');

    // Then
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
