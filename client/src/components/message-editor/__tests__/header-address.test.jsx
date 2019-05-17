import React from 'react';
import {mount, shallow} from 'enzyme/build/index';
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
    test('fieldClick, input grabs focus', () => {
      // Given
      const props = {id: 'to'};
      const focus = jest.fn();
      const headerAddress = mount(<HeaderAddress {...props}/>);
      headerAddress.find('input#to').getDOMNode().focus = focus;

      // When
      headerAddress.find('div').first().simulate('click', {});

      // Then
      expect(focus).toHaveBeenCalledTimes(1);
    });
    describe('Autosuggest built-in integrated events', () => {
      test('onSuggestionChange, non-empty value, state value is changed, and addresses are fetched', () => {
        // Given
        const getAddresses = jest.fn(() => ['test@test.com']);
        const props = {id: 'to', getAddresses};
        const headerAddress = mount(<HeaderAddress {...props}/>);

        // When
        headerAddress.find('input#to').simulate('change', {target: {value: '1337'}});

        // Then
        expect(getAddresses).toHaveBeenCalledTimes(1);
        expect(headerAddress.state().value).toEqual('1337');
        expect(headerAddress.state().suggestions).toEqual(['test@test.com']);
      });
      test('onSuggestionChange, empty value, addresses are cleared', () => {
        // Given
        const getAddresses = jest.fn(() => ['test@test.com']);
        const props = {id: 'to', getAddresses};
        const headerAddress = mount(<HeaderAddress {...props}/>);
        headerAddress.state().suggestions = ['not@empty'];

        // When
        headerAddress.find('input#to').simulate('change', {target: {value: ''}});

        // Then
        expect(headerAddress.state().suggestions).toEqual([]);
      });
      test('getSuggestionValue, valid string input, should return same input', () => {
        // Given
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props}/>);

        // When
        const result = headerAddress.find('Autosuggest').props().getSuggestionValue('1337');

        // Then
        expect(result).toBe('1337');
      });
      test('renderSuggestion, valid string suggestionValue, should return just a string', () => {
        // Given
        const props = {id: 'to'};
        const headerAddress = shallow(<HeaderAddress {...props}/>);

        // When
        const result = headerAddress.find('Autosuggest').props().renderSuggestion('1337');

        // Then
        expect(result).toBe('1337');
      });
      test('onSuggestionSelected, valid suggestion, should add address and clear input value', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to', onAddressAdd};
        const headerAddress = shallow(<HeaderAddress {...props}/>);
        headerAddress.state().value = '1337';

        // When
        headerAddress.find('Autosuggest').props().onSuggestionSelected({}, {suggestionValue: '1337'});

        // Then
        expect(headerAddress.state().value).toEqual('');
        expect(onAddressAdd).toHaveBeenCalledTimes(1);
      });
    });
    describe('HeaderKeyDown', () => {
      test('HeaderKeyPress, with valid e-mail and Enter key, should trigger addressAdd', () => {
        // Given
        const onAddressAdd = jest.fn();
        const setCustomValidity = jest.fn();
        const props = {id: 'to'};
        const headerAddress = mount(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyDown', {
          key: 'Enter', preventDefault: () => { },
          target: {
            id: 'to', value: 'valida@email', validity: {valid: true},
            focus: () => {}, setCustomValidity}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(1);
        expect(setCustomValidity).toHaveBeenCalledTimes(1);
      });
      test('HeaderKeyPress, with valid e-mail and NOT Enter key, should do nothing', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to'};
        const headerAddress = mount(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyDown', {
          key: 'a', preventDefault: () => {}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
      });
      test('HeaderKeyPress, with invalid e-mail and Enter key, should do nothing', () => {
        // Given
        const onAddressAdd = jest.fn();
        const setCustomValidity = jest.fn();
        const reportValidity = jest.fn();
        const props = {id: 'to'};
        const headerAddress = mount(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('keyDown', {
          key: 'Enter',
          target: {id: 'to', value: 'not valid', validity: {valid: false}, setCustomValidity, reportValidity}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
        expect(setCustomValidity).toHaveBeenCalledTimes(2);
        setTimeout(() => expect(reportValidity).toHaveBeenCalledTimes(1));
      });
    });
    describe('HeaderBlur', () => {
      test('HeaderBlur, with valid e-mail, should trigger addressAdd', () => {
        // Given
        const onAddressAdd = jest.fn();
        const props = {id: 'to'};
        const headerAddress = mount(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

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
        const setCustomValidity = jest.fn();
        const reportValidity = jest.fn();
        const props = {id: 'to'};
        const headerAddress = mount(<HeaderAddress {...props} onAddressAdd={onAddressAdd}/>);

        // When
        headerAddress.find('input#to').simulate('blur', {
          preventDefault: () => {},
          target: {id: 'to', value: 'not valid', validity: {valid: false}, setCustomValidity, reportValidity}
        });

        // Then
        expect(onAddressAdd).toHaveBeenCalledTimes(0);
        expect(setCustomValidity).toHaveBeenCalledTimes(1);
        setTimeout(() => expect(reportValidity).toHaveBeenCalledTimes(1));
      });
    });
    describe('DragAndDrop', () => {
      test('addressOnDragStart', () => {
        // Given
        const props = {
          id: 'to',
          addresses: ['name@email.com', 'other@e-mail.mail']
        };
        const event = {
          stopPropagation: jest.fn(),
          target: {
            classList: {
              add: jest.fn(className => {
                expect(className).toEqual('message-editor__header-chip--dragging');
              })
            }
          },
          dataTransfer: {
            setDragImage: jest.fn(),
            setData: jest.fn()
          }
        };
        const headerAddress = shallow(<HeaderAddress {...props}/>);
        // When
        headerAddress.find('.message-editor__header-chip').first().props().onDragStart(event);
        // Then
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(event.target.classList.add).toHaveBeenCalledTimes(1);
        expect(event.dataTransfer.setDragImage).toHaveBeenCalledTimes(1);
        expect(event.dataTransfer.setData).toHaveBeenCalledTimes(1);
      });
      test('addressOnDragEnd', () => {
        // Given
        const props = {
          id: 'to',
          addresses: ['name@email.com', 'other@e-mail.mail']
        };
        const event = {
          stopPropagation: jest.fn(),
          target: {
            classList: {
              remove: jest.fn(className => {
                expect(className).toEqual('message-editor__header-chip--dragging');
              })
            }
          }
        };
        const headerAddress = shallow(<HeaderAddress {...props}/>);
        // When
        headerAddress.find('.message-editor__header-chip').first().props().onDragEnd(event);
        // Then
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(event.target.classList.remove).toHaveBeenCalledTimes(1);
      });
      test('HeaderOnDrop', () => {
        // Given
        const props = {
          id: 'to',
          onAddressMove: jest.fn()
        };
        const event = {
          preventDefault: jest.fn(),
          dataTransfer: {
            types: ['application/json'],
            getData: jest.fn(() => '""')
          }
        };
        const headerAddress = shallow(<HeaderAddress {...props}/>);
        // When
        headerAddress.props().onDrop(event);
        // Then
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(props.onAddressMove).toHaveBeenCalledTimes(1);
      });
    });
  });
});
