import React from 'react';
import {shallow} from 'enzyme/build/index';
import {TopBarMessageList} from '../top-bar-message-list';

describe('TopBarMessageList component test suite', () => {
  test('Snapshot render, with selected messages and all unread, should render top bar message list', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: true, title: 'sideshow bob', sideBarToggle: jest.fn(),
      onDeleteClick: jest.fn(), onMarkReadClick: jest.fn(), onMarkUnreadClick: jest.fn(),
      selectedMessages: [{}], selectedMessagesAllUnread: true};
    // When
    const topBarMessageList = shallow(<TopBarMessageList {...props}/>);
    // Then
    expect(topBarMessageList).toMatchSnapshot();
  });
  test('Snapshot render, with selected messages and NOT all unread, should render top bar message list', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: true, title: 'sideshow bob', sideBarToggle: jest.fn(),
      onDeleteClick: jest.fn(), onMarkReadClick: jest.fn(), onMarkUnreadClick: jest.fn(),
      selectedMessages: [{}], selectedMessagesAllUnread: false};
    // When
    const topBarMessageList = shallow(<TopBarMessageList {...props}/>);
    // Then
    expect(topBarMessageList).toMatchSnapshot();
  });
  test('Snapshot render, with empty selected messages and not all unread, should render top bar message list', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: true, title: 'sideshow bob', sideBarToggle: jest.fn(),
      onDeleteClick: jest.fn(), onMarkReadClick: jest.fn(), onMarkUnreadClick: jest.fn(),
      selectedMessages: [], selectedMessagesAllUnread: false};
    // When
    const topBarMessageList = shallow(<TopBarMessageList {...props}/>);
    // Then
    expect(topBarMessageList).toMatchSnapshot();
  });
});
