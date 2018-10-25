import React from 'react';
import {shallow} from 'enzyme/build/index';
import Snackbar from '../snackbar';

describe('Snackbar component test suite', () => {
  describe('Snapshot render', () => {
    test('Renders all elements', () => {
      // Given
      const {alignStart, show, message, buttonLabel} = {alignStart: true, show: true, message: 'in a bottle',
        buttonLabel: 'White label'};

      // When
      const snackbar = shallow(
        <Snackbar alignStart={alignStart} show={show} message={message} buttonLabel={buttonLabel}/>);

      // Then
      expect(snackbar).toMatchSnapshot();
    });
    test('Renders all elements except button', () => {
      // Given
      const {alignStart, show, message, buttonLabel} = {alignStart: true, show: true, message: 'in a bottle',
        buttonLabel: ''};

      // When
      const snackbar = shallow(
        <Snackbar alignStart={alignStart} show={show} message={message} buttonLabel={buttonLabel}/>);

      // Then
      expect(snackbar).toMatchSnapshot();
    });
    test('Renders all elements, doesn\'t align start', () => {
      // Given
      const {alignStart, show, message, buttonLabel} = {alignStart: false, show: true, message: 'in a bottle',
        buttonLabel: 'White label'};

      // When
      const snackbar = shallow(
        <Snackbar alignStart={alignStart} show={show} message={message} buttonLabel={buttonLabel}/>);

      // Then
      expect(snackbar).toMatchSnapshot();
    });
    test('Renders all elements, hidden/not active', () => {
      // Given
      const {alignStart, show, message, buttonLabel} = {alignStart: false, show: false, message: 'in a bottle',
        buttonLabel: 'White label'};

      // When
      const snackbar = shallow(
        <Snackbar alignStart={alignStart} show={show} message={message} buttonLabel={buttonLabel}/>);

      // Then
      expect(snackbar).toMatchSnapshot();
    });
  });
});
