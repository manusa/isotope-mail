import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ButtonForward} from '../button-forward';

describe('ButtonForward component test suite', () => {
  test('Snapshot render, outboxEmpty, should render button', () => {
    // Given
    const props = {t: jest.fn(arg => arg), outboxEmpty: true, forwardMessage: jest.fn()};
    // When
    const button = shallow(<ButtonForward {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('Snapshot render, not outboxEmpty, should NOT render button', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: false, forwardMessage: jest.fn()};
    // When
    const button = shallow(<ButtonForward {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
});
