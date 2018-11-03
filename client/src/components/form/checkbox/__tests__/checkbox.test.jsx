import React from 'react';
import {shallow} from 'enzyme/build/index';
import Checkbox from '../checkbox';

describe('Checkbox component test suite', () => {
  test('Snapshot render, should render checkbox', () => {
    const {id, fieldClass, inputClass, required, onChange, checked} = {
      id: 'Bourne', fieldClass: 'field-class', inputClass: 'input-class',
      required: true, onChange: () => {}, checked: true};
    const checkbox = shallow(<Checkbox id={id} fieldClass={fieldClass} inputClass={inputClass} required={required}
      onChange={onChange} checked={checked} />);
    expect(checkbox).toMatchSnapshot();
  });
  test('click/change, should trigger onChange function', () => {
    // Given
    const onChange = jest.fn();
    const checkbox = shallow(<Checkbox onChange={onChange}/>);

    // When
    checkbox.find('.mdc-checkbox input').simulate('change', {target: {checked: true}});

    // Then
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
