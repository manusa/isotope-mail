import React from 'react';
import {shallow} from 'enzyme';
import * as messageService from '../../../services/message';
import MessageViewerMenuConnected, {MessageViewerMenu} from '../message-viewer-menu';
import {createMockStore} from '../../../__testutils__/store';
import {INITIAL_STATE} from '../../../reducers';

describe('MessageViewerMenu component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });

  describe('Snapshot render', () => {
    test('Snapshot render, visible, should render message-viewer-menu', () => {
      // Given
      const props = {t, selectedFolder: {}, selectedMessage: {}, visible: true};
      // When
      const messageViewerMenu = shallow(<MessageViewerMenu {...props}/>);
      // Then
      expect(messageViewerMenu).toMatchSnapshot();
    });
    test('Snapshot render, visible=false, should render message-viewer-menu "hidden', () => {
      // Given
      const props = {t, selectedFolder: {}, selectedMessage: {}, visible: false};
      // When
      const messageViewerMenu = shallow(<MessageViewerMenu {...props}/>);
      // Then
      expect(messageViewerMenu).toMatchSnapshot();
    });
  });
  describe('Events tests', () => {
    test('Download click, should invoke downloadMessage', () => {
      // Given
      const props = {t, selectedFolder: {}, selectedMessage: {}, visible: true, downloadMessage: jest.fn()};
      const messageViewerMenu = shallow(<MessageViewerMenu {...props}/>);
      // When
      messageViewerMenu.find('li').simulate('click', {});
      // Then
      expect(props.downloadMessage).toHaveBeenCalledTimes(1);
    });
  });
  describe('Redux properties', () => {
    test('setMessageFilter, should invoke application setMessageFilterKey action', () => {
      // Given
      messageService.downloadMessage = jest.fn();
      const store = createMockStore({...INITIAL_STATE});
      const messageViewerMenu = shallow(<MessageViewerMenuConnected store={store} />);
      // When
      messageViewerMenu.props().downloadMessage();
      // Then
      expect(messageService.downloadMessage).toHaveBeenCalledTimes(1);
    });
  });
});
