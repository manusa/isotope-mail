import React from 'react';
import {shallow} from 'enzyme';
import {createMockStore} from '../../../../__testutils__/store';
import {INITIAL_STATE} from '../../../../reducers';

describe('MessageViewerMenu component test suite', () => {
  let t;
  let applicationService;
  let messageService;
  let MessageViewerMenu;
  let MessageViewerMenuConnected;
  beforeEach(() => {
    jest.resetModules();
    t = jest.fn(arg => arg);
    jest.mock('../../../../services/application');
    applicationService = require('../../../../services/application');
    jest.mock('../../../../services/message');
    messageService = require('../../../../services/message');
    MessageViewerMenu = require('../message-viewer-menu').MessageViewerMenu;
    MessageViewerMenuConnected = require('../message-viewer-menu').default;
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
  });
  describe('Redux properties', () => {
    test('downloadMessage, should invoke downloadMessage in message service', () => {
      // Given
      messageService.downloadMessage.mockImplementationOnce(() => ({}));
      const store = createMockStore({...INITIAL_STATE});
      const messageViewerMenu = shallow(<MessageViewerMenuConnected store={store} />);
      // When
      messageViewerMenu.props().downloadMessage();
      // Then
      expect(messageService.downloadMessage).toHaveBeenCalledTimes(1);
    });
    test('replyMessage, should invoke replyMessage in application service', () => {
      // Given
      const dispatchedReplyMessage = jest.fn();
      applicationService.replyMessage.mockImplementationOnce(() => dispatchedReplyMessage);
      const store = createMockStore({...INITIAL_STATE});
      const messageViewerMenu = shallow(<MessageViewerMenuConnected store={store} />);
      // When
      messageViewerMenu.props().replyMessage();
      // Then
      expect(applicationService.replyMessage).toHaveBeenCalledTimes(1);
      expect(dispatchedReplyMessage).toHaveBeenCalledTimes(1);
    });
  });
});
