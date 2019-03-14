import React from 'react';
import {shallow} from 'enzyme/build/index';
import ButtonDelete from '../button-delete';

describe('ButtonDelete component test suite', () => {
  test('Snapshot render, should render button', () => {
    // Given
    const props = {onClick: jest.fn()};
    // When
    const button = shallow(<ButtonDelete {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('click, should trigger function', () => {
    // Given
    const props = {onClick: jest.fn()};
    const button = shallow(<ButtonDelete {...props}/>);
    // When
    button.find('button').simulate('click');
    // Then
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
