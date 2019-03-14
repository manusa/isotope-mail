import React from 'react';
import {shallow} from 'enzyme/build/index';
import TopBarMessageList from '../top-bar-message-list';

describe('TopBarMessageList component test suite', () => {
  test('Snapshot render, should render top bar message list', () => {
    // Given
    const props = {collapsed: true, title: 'sideshow bob', sideBarToggle: jest.fn(),
      onDeleteClick: jest.fn(), onMarkReadClick: jest.fn(), onMarkUnreadClick: jest.fn(),
      selectedMessagesAllUnread: true};
    // When
    const topBarMessageList = shallow(<TopBarMessageList {...props}/>);
    // Then
    expect(topBarMessageList).toMatchSnapshot();
  });
});
