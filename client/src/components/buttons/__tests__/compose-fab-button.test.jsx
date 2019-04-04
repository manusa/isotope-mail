import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ComposeFabButton} from '../compose-fab-button';


describe('ComposeFabButton component test suite', () => {
  test('Snapshot render, should render compose-fab-button', () => {
    // Given
    const props = {t: key => key, onClick: jest.fn()};
    // When
    const composeFabButton = shallow(<ComposeFabButton {...props} />);
    // Then
    expect(composeFabButton).toMatchSnapshot();
  });
  test('click, should trigger function', () => {
    // Given
    const props = {t: key => key, onClick: jest.fn()};
    const composeFabButton = shallow(<ComposeFabButton {...props} />);
    // When
    composeFabButton.find('button').simulate('click');
    // Then
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });
});
