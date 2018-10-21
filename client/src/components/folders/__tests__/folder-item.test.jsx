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
});
