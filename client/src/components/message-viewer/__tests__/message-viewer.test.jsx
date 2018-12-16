import React from 'react';
import {shallow} from 'enzyme/build/index';
import {addressGroups, MessageViewer} from '../message-viewer';


describe('MessageViewer component test suite', () => {
  describe('Snapshot render', () => {
    test('Should render MessageViewer', () => {
      // Given
      const props = {
        t: jest.fn(messageKey => messageKey),
        currentFolder: {
          name: 'Folder 1337'
        },
        selectedMessage: {
          from: '"Mr. Pink" mrpink@thelevy.com',
          receivedDate: '1912-06-23T00:13:37+00:00',
          subject: 'News from 1337',
          content: '<html><body><p>Please tell me what\'s been bothering you.</p></body></html>',
          attachments: [{fileName: 'ELIZA.test', size: 1337}]
        }
      };

      // When
      const messageViewer = shallow(<MessageViewer {...props}/>);

      // Then
      expect(messageViewer).toMatchSnapshot();
    });
  });
  describe('addressGroups', () => {
    test('addressGroups, formattedAddress, should return name and e-mail', () => {
      // Given
      const formattedAddress = '"Mr. Pink" mrpink@thelevy.com';

      // When
      const address = addressGroups(formattedAddress);

      // Then
      expect(address.name).toEqual('Mr. Pink');
      expect(address.email).toEqual('mrpink@thelevy.com');
    });
    test('addressGroups, formattedAddress with guillemets, should return name and e-mail', () => {
      // Given
      const formattedAddress = '"Mr. Pink" \<mrpink@thelevy.com\>';

      // When
      const address = addressGroups(formattedAddress);

      // Then
      expect(address.name).toEqual('Mr. Pink');
      expect(address.email).toEqual('mrpink@thelevy.com');
    });
    test('addressGroups, email, should return e-mail in name field :/', () => {
      // Given
      const formattedAddress = 'mrpink@thelevy.com';

      // When
      const address = addressGroups(formattedAddress);

      // Then
      expect(address.name).toEqual('mrpink@thelevy.com');
      expect(address.email).toEqual('');
    });
  });
});
