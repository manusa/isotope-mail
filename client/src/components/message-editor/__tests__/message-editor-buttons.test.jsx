import React from 'react';
import {shallow} from 'enzyme/build/index';
import MessageEditorButtons from '../message-editor-buttons';


describe('MessageEditorButtons component test suite', () => {
  let commonProps;
  beforeAll(() => {
    commonProps = {
      editor: {
        selection: {
          getNode: jest.fn(() => ({}))
        }
      },
      editorState: {
        bold: true
      },
      parentSetState: jest.fn()
    };
  });
  test('Snapshot render, should render MessageEditorButtons', () => {
    // Given
    const props = {...commonProps};
    // When
    const messageEditorButtons = shallow(<MessageEditorButtons {...props} />);
    // Then
    expect(messageEditorButtons).toMatchSnapshot();
  });
  describe('Component events', () => {
    test('onToggle, should trigger button toggleFunction', () => {
      // Given
      const messageEditorButtons = shallow(<MessageEditorButtons {...commonProps} />);
      // When
      messageEditorButtons.find('MceButton[icon="link"]').props().onToggle();
      // Then
      expect(commonProps.parentSetState).toHaveBeenCalledTimes(1);
    });
  });
});
