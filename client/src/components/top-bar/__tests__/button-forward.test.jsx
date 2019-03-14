import React from 'react';
import {shallow} from 'enzyme/build/index';
import ButtonForward from '../button-forward';

describe('ButtonForward component test suite', () => {
  test('Snapshot render, outboxEmpty, should render button', () => {
    // Given
    const props = {outboxEmpty: true, forwardMessage: jest.fn()};
    // When
    const button = shallow(<ButtonForward {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('Snapshot render, not outboxEmpty, should NOT render button', () => {
    // Given
    const props = {collapsed: false, forwardMessage: jest.fn()};
    // When
    const button = shallow(<ButtonForward {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('click, should trigger function', () => {
    // Given
    const props = {outboxEmpty: true, forwardMessage: jest.fn()};
    const button = shallow(<ButtonForward {...props}/>);
    // When
    button.find('button').simulate('click');
    // Then
    expect(props.forwardMessage).toHaveBeenCalledTimes(1);
  });
});
