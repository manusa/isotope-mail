import React from 'react';
import {shallow} from 'enzyme/build';
import ReplyListItem from '../reply-list-item';

describe('ReplyListItem component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });
  describe('Snapshot render', () => {
    test('Snapshot render, should render DownloadListItem', () => {
      // Given
      const props = {t, replyAction: jest.fn()};
      // When
      const replyListItem = shallow(<ReplyListItem {...props}/>);
      // Then
      expect(replyListItem).toMatchSnapshot();
    });
  });
});
