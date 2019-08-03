import React from 'react';
import {shallow} from 'enzyme/build';
import DownloadListItem from '../download-list-item';


describe('DownloadListItem component test suite', () => {
  let t;
  beforeAll(() => {
    t = jest.fn(arg => arg);
  });
  describe('Snapshot render', () => {
    test('Snapshot render, should render DownloadListItem', () => {
      // Given
      const props = {t, selectedFolder: {}, selectedMessage: {}, visible: true};
      // When
      const downloadListItem = shallow(<DownloadListItem {...props}/>);
      // Then
      expect(downloadListItem).toMatchSnapshot();
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
});
