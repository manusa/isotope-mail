import React from 'react';
import {shallow} from 'enzyme';
import * as messageService from '../../../services/message';
import MessageViewerMenuConnected, {
  MessageViewerMenu, DownloadListItem, ListUnsubscribeListItem
} from '../message-viewer-menu';
import {createMockStore} from '../../../__testutils__/store';
import {INITIAL_STATE} from '../../../reducers';

describe('MessageViewerMenu component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });

  describe('Snapshot render', () => {
    describe('MessageViewerMenu', () => {
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
    describe('DownloadListItem', () => {
      test('Snapshot render, should render DownloadListItem', () => {
        // Given
        const props = {t, selectedFolder: {}, selectedMessage: {}, visible: true};
        // When
        const downloadListItem = shallow(<DownloadListItem {...props}/>);
        // Then
        expect(downloadListItem).toMatchSnapshot();
      });
    });
    describe('ListUnsubscribeListItem', () => {
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
  describe('Events tests', () => {
    test('Download click, should invoke downloadMessage', () => {
      // Given
      const props = {t, downloadMessage: jest.fn()};
      const downloadListItem = shallow(<DownloadListItem {...props}/>);
      // When
      downloadListItem.find('li').simulate('click', {});
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
