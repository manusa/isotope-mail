import React from 'react';
import {shallow} from 'enzyme/build/index';
import Switch from '../switch';

describe('Checkbox component test suite', () => {
  test('Snapshot render, should render switch', () => {
    const {id, label, required, checked, onToggle, switchClass, inputClass} = {
      id: 'Bourne', label: 'White label',
      required: true, checked: true, onToggle: () => {},
      switchClass: 'switch-class', inputClass: 'input-class'};
    const switchh = shallow(<Switch id={id} label={label} required={required} checked={checked}
      onToggle={onToggle} switchClass={switchClass} inputClass={inputClass}/>);
    expect(switchh).toMatchSnapshot();
  });
  test('click, should trigger onToggle function', () => {
    // Given
    const onToggle = jest.fn();
    const preventDefault = jest.fn();
    const switchh = shallow(<Switch onToggle={onToggle}/>);

    // When
    switchh.simulate('click', {preventDefault: preventDefault});

    // Then
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
