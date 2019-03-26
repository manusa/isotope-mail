import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ButtonCollapse} from '../button-collapse';

describe('ButtonCollapse component test suite', () => {
  test('Snapshot render, collapsed, should render button', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: true, sideBarToggle: jest.fn()};
    // When
    const button = shallow(<ButtonCollapse {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('Snapshot render, not collapsed, should NOT render button', () => {
    // Given
    const props = {collapsed: false, sideBarToggle: jest.fn()};
    // When
    const button = shallow(<ButtonCollapse {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
});
