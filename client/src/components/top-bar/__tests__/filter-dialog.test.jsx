import React from 'react';
import {shallow} from 'enzyme';
import {createMockStore} from '../../../__testutils__/store';
import {INITIAL_STATE} from '../../../reducers';
import MessageFilters from '../../../services/message-filters';
import FilterDialogConnected, {FilterDialog} from '../filter-dialog';

describe('FilterDialog component test suite', () => {
  let commonProps;

  beforeEach(() => {
    commonProps = {
      t: jest.fn(arg => arg),
      closeFilterDialogHandler: jest.fn(),
      activeMessageFilter: MessageFilters.ALL,
      messageFilterText: '',
      setMessageFilterKey: jest.fn(),
      setMessageFilterText: jest.fn()
    };
  });

  describe('Snapshot render', () => {
    test('Snapshot render, visible, should render filter-dialog', () => {
      // Given
      const props = {...commonProps, visible: true};
      // When
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
    test('Snapshot render, visible=false, should render filter-dialog "hidden"', () => {
      // Given
      const props = {...commonProps, visible: false};
      // When
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // Then
      expect(filterDialog).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('Input text filter changed, should invoke setMessageFilterText', () => {
      // Given
      const props = {...commonProps, visible: true};
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // When
      filterDialog.find('li').find('input').simulate('change', {target: {}});
      // Then
      expect(props.setMessageFilterText).toHaveBeenCalledTimes(1);
    });
    test('Input text filter mousedown, should disable closeFilterDialogHandler', () => {
      // Given
      const props = {...commonProps, visible: true};
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // When
      filterDialog.find('li').find('input').simulate('mousedown', {target: {}});
      // Then
      expect(props.closeFilterDialogHandler.disabled).toBe(true);
    });
    test('Item click, should invoke setMessageFilterKey', () => {
      // Given
      const props = {...commonProps, visible: true};
      const filterDialog = shallow(<FilterDialog {...props}/>);
      // When
      filterDialog.find('li').findWhere(li => li.key() === 'ALL').simulate('click', {});
      // Then
      expect(props.setMessageFilterKey).toHaveBeenCalledTimes(1);
    });
  });
  describe('Redux properties', () => {
    test('setMessageFilterKey, should invoke application setMessageFilterKey action', () => {
      // Given
      const store = createMockStore({...INITIAL_STATE});
      const filterDialog = shallow(<FilterDialogConnected store={store} />);
      // When
      filterDialog.props().setMessageFilterKey(MessageFilters.READ);
      // Then
      expect(store.getState().application.messageFilterKey).toBe('READ');
    });
    test('setMessageFilterText, should invoke application setMessageFilterText action', () => {
      // Given
      const store = createMockStore({...INITIAL_STATE});
      const filterDialog = shallow(<FilterDialogConnected store={store} />);
      // When
      filterDialog.props().setMessageFilterText('1337');
      // Then
      expect(store.getState().application.messageFilterText).toBe('1337');
    });
  });
});
