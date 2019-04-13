import React from 'react';
import {shallow} from 'enzyme';
import {createMockStore} from '../../../__testutils__/store';
import {INITIAL_STATE} from '../../../reducers';
import MessageFilters from '../../../services/message-filters';
import FilterDialogConnected, {FilterDialog} from '../filter-dialog';

describe('FilterDialog component test suite', () => {
  let t;
  let activeMessageFilter;
  let setMessageFilter;

  beforeAll(() => {
    t = jest.fn(arg => arg);
    activeMessageFilter = MessageFilters.ALL;
    setMessageFilter = jest.fn();
  });

  describe('Snapshot render', () => {
    test('Snapshot render, visible, should render filter-dialog', () => {
      // Given
      const props = {t, activeMessageFilter, setMessageFilter, visible: true};
      // When
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
    test('Snapshot render, visible=false, should render filter-dialog "hidden"', () => {
      // Given
      const props = {t, activeMessageFilter, setMessageFilter, visible: false};
      // When
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('Item click, should invoke setMessageFilter', () => {
      // Given
      const props = {t, activeMessageFilter, setMessageFilter, visible: true};
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // When
      filterDialog.find('li').findWhere(li => li.key() === 'ALL').simulate('click', {});
      // Then
      expect(setMessageFilter).toHaveBeenCalledTimes(1);
    });
  });
  describe('Redux properties', () => {
    test('setMessageFilter, should invoke application setMessageFilterKey action', () => {
      // Given
      const store = createMockStore({...INITIAL_STATE});
      const filterDialog = shallow(<FilterDialogConnected store={store} />);
      // When
      filterDialog.props().setMessageFilter(MessageFilters.READ);
      // Then
      expect(store.getState().application.messageFilterKey).toBe('READ');
    });
  });
});
