import React from 'react';
import {shallow} from 'enzyme/build/index';
import ButtonReply from '../button-reply';

describe('ButtonReply component test suite', () => {
  test('Snapshot render, outboxEmpty, should render button', () => {
    // Given
    const props = {outboxEmpty: true, replyMessage: jest.fn()};
    // When
    const button = shallow(<ButtonReply {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('Snapshot render, not outboxEmpty, should NOT render button', () => {
    // Given
    const props = {collapsed: false, replyMessage: jest.fn()};
    // When
    const button = shallow(<ButtonReply {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
});
