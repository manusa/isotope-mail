import React from 'react';
import {shallow} from 'enzyme/build/index';
import IconButton from '../icon-button';

describe('IconButton component test suite', () => {
  test('Snapshot render, should render icon-button', () => {
    // Given
    const props = {className: 'higher-class', onClick: jest.fn(), disabled: false};
    // When
    const iconButton = shallow(<IconButton {...props}>material_icon_name</IconButton>);
    // Then
    expect(iconButton).toMatchSnapshot();
  });
  test('click, should trigger function', () => {
    // Given
    const props = {className: 'higher-class', onClick: jest.fn(), disabled: false};
    const iconButton = shallow(<IconButton {...props}>material_icon_name</IconButton>);
    // When
    iconButton.find('button').simulate('click');
    // Then
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
