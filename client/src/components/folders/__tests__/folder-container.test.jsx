import React from 'react';
import {shallow} from 'enzyme';
import {FolderContainer} from '../folder-container';

describe('FolderContainer component test suite', () => {
  test('Snapshot render, should render FolderContainer', () => {
    // Given
    const props = {
      t: key => key,
      activeRequests: 0,
      folders: {},
      folderTree: [{folders: {}, folderTree: []}],
      selectedFolder: {folderId: '1337-3'}
    };

    // When
    const folderContainer = shallow(<FolderContainer {...props} />);

    // Then
    expect(folderContainer).toMatchSnapshot();
  });
});
