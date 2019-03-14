import React from 'react';
import {shallow} from 'enzyme/build/index';
import TopBarMessageEditor from '../top-bar-message-editor';

describe('TopBarMessageEditor component test suite', () => {
  test('Snapshot render, should render top bar message editor', () => {
    // Given
    const props = {collapsed: true, title: 'sideshow bob', sideBarToggle: jest.fn()};
    // When
    const topBarMessageEditor = shallow(<TopBarMessageEditor {...props}/>);
    // Then
    expect(topBarMessageEditor).toMatchSnapshot();
  });
});
