import React from 'react';
import {shallow} from 'enzyme/build';
import Routes from '../routes';


describe('Routes component test suite', () => {
  test('Snapshot render', () => {
    // When
    const routes = shallow(<Routes />);
    // Then
    expect(routes).toMatchSnapshot();
  });
});
