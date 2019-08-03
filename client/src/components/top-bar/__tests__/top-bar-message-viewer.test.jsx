import React from 'react';
import {shallow} from 'enzyme/build/index';
import {TopBarMessageViewer} from '../top-bar-message-viewer';

describe('TopBarMessageViewer component test suite', () => {
  test('Snapshot render, should render top bar message viewer', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: true, sideBarToggle: jest.fn(), clearSelectedMessage: jest.fn(),
      onDeleteClick: jest.fn(), onForwardMessageClick: jest.fn(), onMarkUnreadClick: jest.fn(),
      onReplyAllMessageClick: jest.fn(), outboxEmpty: true};
    // When
    const topBarMessageViewer = shallow(<TopBarMessageViewer {...props}/>);
    // Then
    expect(topBarMessageViewer).toMatchSnapshot();
  });
});
