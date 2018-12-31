import React from 'react';
import {shallow} from 'enzyme/build/index';
import Button from '../button';

describe('Button component test suite', () => {
  test('Snapshot render, should render button', () => {
    const props = {className: 'first-class', type: 'button', label: 'Black Label',
      icon: 'Andy Warhol', disabled: false};
    const button = shallow(<Button {...props}/>);
    expect(button).toMatchSnapshot();
  });
  test('click, should trigger function', () => {
    // Given
    const onClick = jest.fn();
    const button = shallow(<Button onClick={onClick}/>);

    // When
    button.find('button').simulate('click');

    // Then
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
