import React from 'react';
import {shallow} from 'enzyme/build/index';
import MceButton from '../mce-button';

describe('MceButton component test suite', () => {
  test('Snapshot render, should render MceButton', () => {
    const props = {
      className: 'WorkerClass', activeClassName: 'It\'s-a-free-world', iconClassName: 'Upper-class',
      active: true, icon: 'Roy Lichtenstein'};
    const mceButton = shallow(<MceButton {...props} />);
    expect(mceButton).toMatchSnapshot();
  });
  test('Snapshot render with no icon and inactive, should render MceButton', () => {
    const props = {
      className: 'Worker-Class', activeClassName: 'Not-shown', iconClassName: 'Neither', active: false};
    const mceButton = shallow(<MceButton {...props} />);
    expect(mceButton).toMatchSnapshot();
  });
  test('component events, events fired', () => {
    // Given
    const onToggle = jest.fn();
    const props = {
      className: 'WorkerClass', activeClassName: 'It\'s-a-free-world', iconClassName: 'Upper-class', active: true};
    const mceButton = shallow(<MceButton {...props} onToggle={onToggle} />);

    // When
    mceButton.find('button').simulate('mouseDown', {preventDefault: () => {}});
    mceButton.find('button').simulate('mouseUp');

    // Then
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
