import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ButtonReplyAll} from '../button-reply-all';

describe('ButtonReplyAll component test suite', () => {
  test('Snapshot render, outboxEmpty, should render button', () => {
    // Given
    const props = {t: jest.fn(arg => arg), outboxEmpty: true, replyAllMessage: jest.fn()};
    // When
    const button = shallow(<ButtonReplyAll {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
  test('Snapshot render, not outboxEmpty, should NOT render button', () => {
    // Given
    const props = {t: jest.fn(arg => arg), collapsed: false, replyAllMessage: jest.fn()};
    // When
    const button = shallow(<ButtonReplyAll {...props}/>);
    // Then
    expect(button).toMatchSnapshot();
  });
});
