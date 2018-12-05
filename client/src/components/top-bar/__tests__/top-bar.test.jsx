import React from 'react';
import {shallow} from 'enzyme/build/index';
import {TopBar} from '../top-bar';
import {FolderTypes} from '../../../services/folder';

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
});
