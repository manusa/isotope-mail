import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ButtonFilter} from '../button-filter';
import MessageFilters from '../../../services/message-filters';

describe('ButtonFilter component test suite', () => {
  describe('Snapshot render', () => {
    test('Snapshot render, not active, should render deactivated button-filter', () => {
      // Given
      const props = {t: jest.fn(arg => arg), active: false};
      // When
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      // Then
      expect(buttonFilter).toMatchSnapshot();
    });
    test('Snapshot render, active, should render activated button-filter', () => {
      // Given
      const props = {t: jest.fn(arg => arg), active: true};
      // When
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      // Then
      expect(buttonFilter).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('unmount, window should not contain event listeners', () => {
      // Given
      const originalAddEventListener = window.addEventListener;
      const originalRemoveEventListener = window.removeEventListener;
      window.addEventListener = jest.fn(() => originalAddEventListener.apply(null, arguments));
      window.removeEventListener = jest.fn(() => originalRemoveEventListener.apply(null, arguments));
      const props = {t: jest.fn(arg => arg), activeMessageFilter: MessageFilters.READ};
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      // When
      buttonFilter.unmount();
      // Then
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
      expect(window.removeEventListener).toHaveBeenCalledTimes(1);
    });
    test('onToggleDialog, state is changed', () => {
      // Given
      const props = {t: jest.fn(arg => arg), active: true};
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      const event = {stopPropagation: jest.fn()};
      // When
      buttonFilter.find('TopBarButton').props().onClick(event);
      // Then
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
      expect(buttonFilter.state().dialogVisible).toBe(true);
    });
    test('onCloseDialog, dialog is visible and function is NOT disabled, state.dialogVisible is false', () => {
      // Given
      const props = {t: jest.fn(arg => arg), active: true};
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      buttonFilter.state().dialogVisible = true;
      // When
      buttonFilter.instance().handleOnCloseDialog();
      // Then
      expect(buttonFilter.state().dialogVisible).toBe(false);
    });
    test('onCloseDialog, disalog is visible and function is disabled, state.dialogVisible is true', () => {
      // Given
      const props = {t: jest.fn(arg => arg), active: true};
      const buttonFilter = shallow(<ButtonFilter {...props}/>);
      buttonFilter.state().dialogVisible = true;
      buttonFilter.find('Connect(Translate(FilterDialog))').props().closeFilterDialogHandler.disabled = true;
      // When
      buttonFilter.instance().handleOnCloseDialog();
      // Then
      expect(buttonFilter.state().dialogVisible).toBe(true);
    });
  });
});
