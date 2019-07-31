import React from 'react';
import {shallow} from 'enzyme/build';
import Routes from '../routes';


describe('Routes component test suite', () => {
  test('Snapshot render', () => {
    // Given
    const routes = shallow(<Routes />);
    // When
    const wrappedSwitch = routes.find('SwitchWrapper').dive();
    // Then
    expect(wrappedSwitch).toMatchSnapshot();
  });
});
