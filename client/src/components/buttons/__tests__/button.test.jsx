import React from 'react';
import {shallow} from 'enzyme/build/index';
import Button from '../button';

describe('Button component test suite', () => {
  test('Snapshot render, should render button', () => {
    const {className, type, label, icon} = {className: 'first-class', type: 'NotMyType', label: 'Black Label',
      icon: 'Andy Warhol'};
    const button = shallow(<Button className={className} type={type} label={label} icon={icon}/>);
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
