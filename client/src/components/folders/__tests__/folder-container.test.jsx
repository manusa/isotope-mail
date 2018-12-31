import React from 'react';
import {shallow} from 'enzyme';
import {FolderContainer} from '../folder-container';

describe('FolderContainer component test suite', () => {
  test('Snapshot render, should render FolderContainer', () => {
    const {activeRequests, folderList, selectedFolder} = {
      activeRequests: 0, folderList: [{folderList: []}], selectedFolder: {folderId: '1337-3'}};
    const folderContainer = shallow(
      <FolderContainer activeRequests={activeRequests} folderList={folderList}
        selectedFolder={selectedFolder}/>);
    expect(folderContainer).toMatchSnapshot();
  });
});
