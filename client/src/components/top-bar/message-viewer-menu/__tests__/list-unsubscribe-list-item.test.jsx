import React from 'react';
import {shallow} from 'enzyme/build';
import ListUnsubscribeListItem from '../list-unsubscribe-list-item';

describe('ListUnsubscribeListItem component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });
  describe('Snapshot render', () => {
    test('Snapshot render, no listUnsubscribe, should render empty ListUnsubscribeListItem', () => {
      // Given
      const props = {t, message: {}};
      // When
      const listUnsubscribeListItem = shallow(<ListUnsubscribeListItem {...props}/>);
      // Then
      expect(listUnsubscribeListItem).toMatchSnapshot();
    });
    test('Snapshot render, listUnsubscribe with invalid entry, should render empty ListUnsubscribeListItem', () => {
      // Given
      const props = {t, message: {
        listUnsubscribe: ['I\'m not valid']
      }};
      // When
      const listUnsubscribeListItem = shallow(<ListUnsubscribeListItem {...props}/>);
      // Then
      expect(listUnsubscribeListItem).toMatchSnapshot();
    });
    test('Snapshot render, listUnsubscribe with valid entries, should render ListUnsubscribeListItem', () => {
      // Given
      const props = {t, message: {
        listUnsubscribe: ['(This is a valid first entry) <mailto:unsubscribe@list.com>, <https://unsbscribe.valid.2.com>']
      }};
      // When
      const listUnsubscribeListItem = shallow(<ListUnsubscribeListItem {...props}/>);
      // Then
      expect(listUnsubscribeListItem).toMatchSnapshot();
    });
  });
});
