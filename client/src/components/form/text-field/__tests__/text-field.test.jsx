import React from 'react';
import {shallow} from 'enzyme/build/index';
import TextField from '../text-field';

describe('TextField component test suite', () => {
  describe('Snapshot render', () => {
    test('Snapshot render, should render text-field', () => {
      // Given
      const props = {
        id: 'Bourne',
        min: 1337,
        label: 'Red label'
      };

      // When
      const textField = shallow(<TextField {...props} />);

      // Then
      expect(textField).toMatchSnapshot();
    });

  });
});
