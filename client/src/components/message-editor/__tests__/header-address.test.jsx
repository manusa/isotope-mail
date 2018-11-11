import React from 'react';
import {shallow} from 'enzyme/build/index';
import {HeaderAddress} from '../header-address';

describe('HeaderAddress component test suite', () => {
  test('Snapshot render, should render HeaderAddress', () => {
    const props = {
      t: translation => (translation),
      id: 'I\'mDown',
      className: 'Business',
      chipClassName: 'FirstClassChips',
      addresses: ['name@email.com', 'other@e-mail.mail'],
      label: 'BlackLabel12yrs',
      onKeyPress: () => {},
      onBlur: () => {},
      onAddressRemove: () => {}
    };
    const headerAddress = shallow(<HeaderAddress {...props} />);
    expect(headerAddress).toMatchSnapshot();
  });
});
