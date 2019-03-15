import React from 'react';
import {shallow} from 'enzyme/build/index';
import TopBarButton from '../top-bar-button';

describe('TopBarButton component test suite', () => {
  test('Snapshot render, should render top-bar-button', () => {
    // Given
    const props = {onClick: jest.fn()};
    // When
    const button = shallow(<TopBarButton {...props}>icon_name</TopBarButton>);
    // Then
    expect(button).toMatchSnapshot();
  });
});
