import React from 'react';
import {shallow} from 'enzyme/build/index';
import Dialog from '../dialog';

describe('Dialog component test suite', () => {
  test('Snapshot render, should render dialog', () => {
    const {visible, title, actions, className, containerClassName, contentClassName} = {
      visible: true,
      title: 'Dr. POTUS',
      actions: [
        {label: 'Red label', action: () => {}},
        {label: 'Black disabled label', disabled: true, action: () => {}}
      ],
      className: 'first-class', containerClassName: 'container-class', contentClassName: 'content-class'};
    const dialog = shallow(<Dialog visible={visible} title={title} actions={actions}
      className={className} containerClassName={containerClassName} contentClassName={contentClassName}>
      <p>Dialog content</p>
    </Dialog>);
    expect(dialog).toMatchSnapshot();
  });
});
