import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ConfirmClearFolderDialog} from '../confirm-clear-folder-dialog';

describe('ConfirmClearFolderDialog component test suite', () => {
  describe('Snapshot render', () => {
    test('Defaults, Should render ConfirmClearFolderDialog', () => {
      // Given
      const props = {
        t: jest.fn(messageKey => messageKey),
        visible: true,
        cancelAction: jest.fn(),
        deleteAction: jest.fn()
      };
      // When
      const confirmClearFolderDialog = shallow(<ConfirmClearFolderDialog {...props} />);
      // Then
      expect(confirmClearFolderDialog).toMatchSnapshot();
    });
  });
});
