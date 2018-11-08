import React from 'react';
import {shallow} from 'enzyme/build/index';
import {InsertLinkDialog} from '../insert-link-dialog';

describe('InsertLinkDialog component test suite', () => {
  test('Snapshot render, should render InsertLinkDialog', () => {
    const props = {
      t: translation => (translation),
      visible: true, closeDialog: () => {}, insertLink: () => {}, onChange: () => {}, url: 'http://blog.marcnuri.com'};
    const insertLinkDialog = shallow(<InsertLinkDialog {...props} />);
    expect(insertLinkDialog).toMatchSnapshot();
  });
  test('Textfield onChange, event fired', () => {
    // Given
    const onChange = jest.fn();
    const props = {
      t: translation => (translation),
      visible: true, closeDialog: () => {}, insertLink: () => {}, url: 'http://blog.marcnuri.com'};
    const insertLinkDialog = shallow(<InsertLinkDialog {...props} onChange={onChange} />);

    // When
    insertLinkDialog.find('#link').simulate('change');

    // Then
    expect(onChange).toHaveBeenCalledTimes(1);
  });
  test('Textfield keyDown, event fired, closeDialog function triggered', () => {
    // Given
    const closeDialog = jest.fn();
    const insertLink = jest.fn();
    const props = {
      t: translation => (translation), visible: true, onChange: () => {}, url: 'http://blog.marcnuri.com'};
    const insertLinkDialog = shallow(<InsertLinkDialog
      {...props} closeDialog={closeDialog} insertLink={insertLink}
    />);

    // When
    insertLinkDialog.find('#link').simulate('keyDown', {key: 'Escape', preventDefault: () => {}});

    // Then
    expect(closeDialog).toHaveBeenCalledTimes(1);
    expect(insertLink).toHaveBeenCalledTimes(0);
  });
  test('Textfield keyDown, event fired, insertLink function triggered', () => {
    // Given
    const closeDialog = jest.fn();
    const insertLink = jest.fn();
    const props = {
      t: translation => (translation), visible: true, onChange: () => {}, url: 'http://blog.marcnuri.com'};
    const insertLinkDialog = shallow(<InsertLinkDialog
      {...props} closeDialog={closeDialog} insertLink={insertLink}
    />);

    // When
    insertLinkDialog.find('#link').simulate('keyDown', {key: 'Enter', preventDefault: () => {}});

    // Then
    expect(closeDialog).toHaveBeenCalledTimes(0);
    expect(insertLink).toHaveBeenCalledTimes(1);
  });
  test('Textfield keyDown, event fired, no function triggered', () => {
    // Given
    const closeDialog = jest.fn();
    const insertLink = jest.fn();
    const preventDefault = jest.fn();
    const props = {
      t: translation => (translation), visible: true, onChange: () => {}, url: 'http://blog.marcnuri.com'};
    const insertLinkDialog = shallow(<InsertLinkDialog
      {...props} closeDialog={closeDialog} insertLink={insertLink}
    />);

    // When
    insertLinkDialog.find('#link').simulate('keyDown', {key: 'A', preventDefault});

    // Then
    expect(preventDefault).toHaveBeenCalledTimes(0);
    expect(closeDialog).toHaveBeenCalledTimes(0);
    expect(insertLink).toHaveBeenCalledTimes(0);
  });
});
