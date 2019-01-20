import React from 'react';
import {shallow} from 'enzyme/build/index';
import SingleInputDialog from '../single-input-dialog';

const DEFAULT_MOCK_PROPS = {
  visible: true,
  disabled: false,
  titleLabel: 'Dr. POTUS',
  messageLabel: 'Christmas Message',
  inputLabel: 'This is the input',
  inputValue: 'Initial value',
  cancelLabel: 'Cancel',
  cancelAction: jest.fn(),
  okLabel: 'OK',
  okAction: jest.fn()}

describe('SingleInputDialog component test suite', () => {
  test('Snapshot render, should render SingleInputDialog', () => {
    // Given

    // When
    const singleInputDialog = shallow(<SingleInputDialog {...DEFAULT_MOCK_PROPS} />);

    // Then
    expect(singleInputDialog).toMatchSnapshot();
  });
});
