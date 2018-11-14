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
      onAddressAdd: () => {},
      onAddressRemove: () => {},
      onAddressMove: () => {}
    };
    const headerAddress = shallow(<HeaderAddress {...props} />);
    expect(headerAddress).toMatchSnapshot();
  });
  describe('Event tests', () => {
    describe('HeaderKeyPress', () => {
      test('HeaderKeyPress, with valid e-mail and Enter key, should trigger addressAdd', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyPress', {
          key: 'Enter', preventDefault: () => {
          },
          target: {id: 'to', value: 'valida@email', validity: {valid: true}, focus: () => {}}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(1);
      });
      test('HeaderKeyPress, with valid e-mail and NOT Enter key, should do nothing', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyPress', {
          key: 'a', preventDefault: () => {}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
      });
      test('HeaderKeyPress, with invalid e-mail and Enter key, should do nothing', () => {
        // Given
        const onAddressAdd = jest.fn();
        const reportValidity = jest.fn();
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyPress', {
          key: 'Enter',
          target: {id: 'to', value: 'not valid', validity: {valid: false}, reportValidity}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
        expect(reportValidity).toHaveBeenCalledTimes(1);
      });
    });
    describe('HeaderBlur', () => {
      test('HeaderBlur, with valid e-mail, should trigger addressAdd', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('blur', {
          target: {id: 'to', value: 'valida@email', validity: {valid: true}}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(1);
      });
      test('HeaderBlur, with invalid e-mail, should do nothing', () => {
        // Given
        const onAddressAdd = jest.fn();
        const reportValidity = jest.fn();
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('blur', {
          preventDefault: () => {},
          target: {id: 'to', value: 'not valid', validity: {valid: false}, reportValidity}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
        setTimeout(() => expect(reportValidity).toHaveBeenCalledTimes(1));
      });
    });
  });
});
