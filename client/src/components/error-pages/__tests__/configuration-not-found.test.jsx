import React from 'react';
import {shallow} from 'enzyme/build/index';
import {ConfigurationNotFound} from '../configuration-not-found';


describe('ConfigurationNotFound component test suite', () => {
  test('Snapshot render, should render ConfigurationNotFound', () => {
    // Given
    const props = {t: key => key};
    // When
    const configurationNotFound = shallow(<ConfigurationNotFound {...props}/>);
    // Then
    expect(configurationNotFound).toMatchSnapshot();
  });
});
