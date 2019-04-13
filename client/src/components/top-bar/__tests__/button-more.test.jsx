import React from 'react';
import {act} from 'react-dom/test-utils';
import {shallow, mount} from 'enzyme/build/index';
import {ButtonMore} from '../button-more';

describe('ButtonMore component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });

  describe('Snapshot render', () => {
    test('should render button-more', () => {
      // Given
      const props = {t};
      // When
      const buttonMore = shallow(<ButtonMore {...props}><div>Child</div></ButtonMore>);
      // Then
      expect(buttonMore).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('click, should set children visible', () => {
      // Given
      const props = {t};
      const event = {stopPropagation: jest.fn()};
      const child = <div>Child</div>;
      const buttonMore = shallow(<ButtonMore {...props}>{child}</ButtonMore>);
      // When
      buttonMore.find('TopBarButton').props().onClick(event);
      // Then
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(buttonMore.props()['isotip-hidden']).toBe('true');
    });
    test('unmount, window should not contain event listeners', () => {
      // Given
      const originalAddEventListener = window.addEventListener;
      const originalRemoveEventListener = window.removeEventListener;
      window.addEventListener = jest.fn(() => originalAddEventListener.apply(null, arguments));
      window.removeEventListener = jest.fn(() => originalRemoveEventListener.apply(null, arguments));
      const props = {t};
      const buttonMore = mount(<ButtonMore {...props}><div>Child</div></ButtonMore>);
      // When
      buttonMore.unmount();
      // Then
      expect(window.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
    test('window click, menu close event should be fired', () => {
      // Given
      const props = {t};
      const buttonMore = mount(<ButtonMore {...props}><div>Child</div></ButtonMore>);
      act(() => {
        buttonMore.find('TopBarButton').props().onClick(new Event('click')); // Set menu Open true
      });
      // When
      act(() => {
        window.dispatchEvent(new Event('click')); // Close menu
      });
      // Then
      expect(buttonMore.find('span').props()['isotip-hidden']).toBe('false');
    });
  });
});
