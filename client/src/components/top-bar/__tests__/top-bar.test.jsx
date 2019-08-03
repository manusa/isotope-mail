import React from 'react';
import {shallow} from 'enzyme/build/index';
import TopBarConnected from '../top-bar';
import {TopBar} from '../top-bar';
import {FolderTypes} from '../../../services/folder';
import {createMockStore, MOCK_STORE} from '../../../__testutils__/store';
import * as applicationService from '../../../services/application';
import * as messgeService from '../../../services/message';
import {INITIAL_STATE} from '../../../reducers';

describe('TopBar component test suite', () => {
  describe('Snapshot render', () => {
    test('TopBar with selected folder and no new message and no selected message, should render in list mode', () => {
      // Given
      const props = {
        sideBarCollapsed: false,
        sideBarToggle: jest.fn(),
        selectedFolder: {type: FolderTypes.FOLDER, name: 'SelectedFolder'},
        selectedMessages: [],
        title: 'Isotope Mail Client - TITLE'};

      // When
      const topBar = shallow(<TopBar {...props}/>);

      // Then
      expect(topBar).toMatchSnapshot();
    });
    test('TopBar with selected folder (and messageIds) and no new message and no selected message, should render in list mode with delete and mark read buttons', () => {
      // Given
      const props = {
        sideBarCollapsed: false,
        sideBarToggle: jest.fn(),
        selectedFolder: {type: FolderTypes.FOLDER, name: 'SelectedFolder'},
        selectedMessages: [{uid: 1}],
        title: 'Isotope Mail Client - TITLE'};

      // When
      const topBar = shallow(<TopBar {...props}/>);

      // Then
      expect(topBar).toMatchSnapshot();
    });
    test('TopBar with selected message and no new message and no selected folder, should render in view mode with buttons', () => {
      // Given
      const props = {
        sideBarCollapsed: false,
        sideBarToggle: jest.fn(),
        selectedMessage: {uid: 1},
        title: 'Isotope Mail Client - TITLE',
        outbox: null};

      // When
      const topBar = shallow(<TopBar {...props}/>);

      // Then
      expect(topBar).toMatchSnapshot();
    });
    test('TopBar with new message and no selected message and no selected folder, should render in edit mode without buttons', () => {
      // Given
      const props = {
        sideBarCollapsed: false,
        sideBarToggle: jest.fn(),
        newMessage: {subject: 'New Message'},
        title: 'Isotope Mail Client - TITLE'};

      // When
      const topBar = shallow(<TopBar {...props}/>);

      // Then
      expect(topBar).toMatchSnapshot();
    });
  });
  describe('State properties tests', () => {
    test('clearSelectedMessage, application service function invoked', () => {
      // Given
      applicationService.clearSelectedMessage = jest.fn();
      const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
      const topBar = shallow(<TopBarConnected store={MOCK_STORE} {...props}/>);

      // When
      topBar.props().clearSelectedMessage();

      // Then
      expect(applicationService.clearSelectedMessage).toHaveBeenCalledTimes(1);
    });
    test('replyAllMessage, application service function invoked', () => {
      // Given
      const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application}};
      initialState.application.selectedMessage = {};
      const replyAllMessage = jest.fn(sm => expect(sm).toBe(initialState.application.selectedMessage));
      // noinspection JSUnresolvedVariable
      applicationService.replyAllMessage = jest.fn(() => replyAllMessage);
      const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
      const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

      // When
      topBar.props().replyAllMessage();

      // Then
      expect(applicationService.replyAllMessage).toHaveBeenCalledTimes(1);
      expect(replyAllMessage).toHaveBeenCalledTimes(1);
    });
    test('forwardMessage, application service function invoked', () => {
      // Given
      const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application}};
      initialState.application.selectedMessage = {};
      applicationService.forwardMessage = jest.fn((dispatch, sm) =>
        expect(sm).toBe(initialState.application.selectedMessage));
      const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
      const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

      // When
      topBar.props().forwardMessage();

      // Then
      expect(applicationService.forwardMessage).toHaveBeenCalledTimes(1);
    });
    describe('deleteMessage', () => {
      test('Selected message and selected folder (!== trash), messageService moveMessages function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE,
          application: {...INITIAL_STATE.application}, folders: {...INITIAL_STATE.folders}};
        initialState.application.selectedMessage = {};
        initialState.application.selectedFolderId = '1337';
        initialState.folders.explodedItems = {1337: {}, trash: {type: FolderTypes.TRASH}};
        applicationService.clearSelectedMessage = jest.fn();
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessage();

        // Then
        expect(messgeService.moveMessages).toHaveBeenCalledTimes(1);
        expect(messgeService.deleteMessages).not.toHaveBeenCalled();
        expect(applicationService.clearSelectedMessage).toHaveBeenCalledTimes(1);
      });
      test('Selected message and selected folder (== trash), messageService deleteMessages function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE,
          application: {...INITIAL_STATE.application}, folders: {...INITIAL_STATE.folders}};
        initialState.application.selectedMessage = {};
        initialState.application.selectedFolderId = '1337';
        initialState.folders.explodedItems = {1337: {type: FolderTypes.TRASH}};
        applicationService.clearSelectedMessage = jest.fn();
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessage();

        // Then
        expect(messgeService.deleteMessages).toHaveBeenCalledTimes(1);
        expect(messgeService.moveMessages).not.toHaveBeenCalled();
        expect(applicationService.clearSelectedMessage).toHaveBeenCalledTimes(1);
      });
      test('NO selected message, no function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE};
        applicationService.clearSelectedMessage = jest.fn();
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessage();

        // Then
        expect(messgeService.deleteMessages).not.toHaveBeenCalled();
        expect(messgeService.moveMessages).not.toHaveBeenCalled();
        expect(applicationService.clearSelectedMessage).not.toHaveBeenCalled();
      });
    });
    test('toggleMessageSeen, messageService setMessagesSeen function invoked', () => {
      // Given
      const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application}};
      initialState.application.selectedMessage = {seen: false};
      applicationService.clearSelectedMessage = jest.fn();
      messgeService.setMessagesSeen = jest.fn();
      const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
      const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

      // When
      topBar.props().toggleMessageSeen();

      // Then
      expect(messgeService.setMessagesSeen).toHaveBeenCalledTimes(1);
      expect(applicationService.clearSelectedMessage).toHaveBeenCalledTimes(1);
    });
    describe('deleteMessages', () => {
      test('Selected messages and selected folder (!== trash), messageService moveMessages function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application},
          folders: {...INITIAL_STATE.folders}, messages: {...INITIAL_STATE.messages}};
        initialState.application.selectedFolderId = '1337';
        initialState.folders.explodedItems = {1337: {}, trash: {type: FolderTypes.TRASH}};
        initialState.messages.cache['1337'] = new Map([{uid: 1}, {uid: 3}].map(m => [m.uid, m]));
        initialState.messages.selected = [1];
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessages();

        // Then
        expect(messgeService.moveMessages).toHaveBeenCalledTimes(1);
        expect(messgeService.deleteMessages).not.toHaveBeenCalled();
      });
      test('Selected message and selected folder (== trash), messageService deleteMessages function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application},
          folders: {...INITIAL_STATE.folders}, messages: {...INITIAL_STATE.messages}};
        initialState.application.selectedFolderId = '1337';
        initialState.folders.explodedItems = {1337: {type: FolderTypes.TRASH}};
        initialState.messages.cache['1337'] = new Map([{uid: 1}, {uid: 3}].map(m => [m.uid, m]));
        initialState.messages.selected = [1];
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessages();

        // Then
        expect(messgeService.deleteMessages).toHaveBeenCalledTimes(1);
        expect(messgeService.moveMessages).not.toHaveBeenCalled();
      });
      test('NO selected message, no function invoked', () => {
        // Given
        const initialState = {...INITIAL_STATE};
        messgeService.moveMessages = jest.fn();
        messgeService.deleteMessages = jest.fn();
        const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
        const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

        // When
        topBar.props().deleteMessages();

        // Then
        expect(messgeService.deleteMessages).not.toHaveBeenCalled();
        expect(messgeService.moveMessages).not.toHaveBeenCalled();
      });
    });
    test('setMessagesSeen,' +
      'with selected messages and selected folder, messageService setMessagesSeen function invoked', () => {
      // Given
      const initialState = {...INITIAL_STATE, application: {...INITIAL_STATE.application},
        folders: {...INITIAL_STATE.folders}, messages: {...INITIAL_STATE.messages}};
      initialState.application.selectedFolderId = '1337';
      initialState.folders.explodedItems = {1337: {type: FolderTypes.TRASH}};
      initialState.messages.cache['1337'] = new Map([{uid: 1}, {uid: 3}].map(m => [m.uid, m]));
      initialState.messages.selected = [1];
      messgeService.setMessagesSeen = jest.fn();
      const props = {sideBarToggle: () => {}, sideBarCollapsed: false};
      const topBar = shallow(<TopBarConnected store={createMockStore(initialState)} {...props}/>);

      // When
      topBar.props().setMessagesSeen();

      // Then
      expect(messgeService.setMessagesSeen).toHaveBeenCalledTimes(1);
    });
  });
});
