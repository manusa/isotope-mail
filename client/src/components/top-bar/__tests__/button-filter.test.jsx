import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ButtonFilter} from '../button-filter';
import MessageFilters from '../../../services/message-filters';

describe('ButtonFilter component test suite', () => {
  describe('Snapshot render', () => {
    test('Snapshot render, activeMessageFilter=ALL, should render deactivated button-filter', () => {
      // Given
      const props = {activeMessageFilter: MessageFilters.ALL};
      // When
      const filterDialog = shallow(<ButtonFilter {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
    test('Snapshot render, activeMessageFilter=READ, should render activated button-filter', () => {
      // Given
      const props = {activeMessageFilter: MessageFilters.READ};
      // When
      const filterDialog = shallow(<ButtonFilter {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('unmount, window should not contain event listeners', () => {
      // Given
      const originalAddEventListener = window.addEventListener;
      const originalRemoveEventListener = window.removeEventListener;
      window.addEventListener = jest.fn(() => originalAddEventListener.apply(null, arguments));
      window.removeEventListener = jest.fn(() => originalRemoveEventListener.apply(null, arguments));
      const props = {activeMessageFilter: MessageFilters.READ};
      const filterDialog = shallow(<ButtonFilter {...props}/>);
      // When
      filterDialog.unmount();
      // Then
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.removeEventListener).toHaveBeenCalledTimes(1);
    });
    test('onToggleDialog, state is changed', () => {
      // Given
      const props = {activeMessageFilter: MessageFilters.READ};
      const filterDialog = shallow(<ButtonFilter {...props}/>);
      const event = {stopPropagation: jest.fn()};
      // When
      filterDialog.find('TopBarButton').props().onClick(event);
      // Then
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(filterDialog.state().dialogVisible).toBe(true);
    });
    test('onCloseDialog, state.dialogVisible is false', () => {
      // Given
      const props = {activeMessageFilter: MessageFilters.READ};
      const filterDialog = shallow(<ButtonFilter {...props}/>);
      filterDialog.state().dialogVisible = true;
      // When
      filterDialog.instance().handleOnCloseDialog();
      // Then
      expect(filterDialog.state().dialogVisible).toBe(false);
    });
  });
});
