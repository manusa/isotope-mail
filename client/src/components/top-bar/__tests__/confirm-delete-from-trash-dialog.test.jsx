import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ConfirmDeleteFromTrashDialog} from '../confirm-delete-from-trash-dialog';


describe('ConfirmDeleteFromTrashDialog component test suite', () => {
  test('Snapshot render, should render ConfirmDeleteFromTrashDialog', () => {
    // Given
    const props = {
      t: translation => (translation),
      visible: true,
      cancelAction: () => {},
      deleteAction: () => {}
    };

    // When
    const confirmDeleteFromTrashDialog = shallow(<ConfirmDeleteFromTrashDialog {...props} />);

    // Then
    expect(confirmDeleteFromTrashDialog).toMatchSnapshot();
  });
});
