import React from 'react';
import {shallow} from 'enzyme/build/index';
import ConnectedMessageViewer, {addressGroups, MessageViewer} from '../message-viewer';
import {INITIAL_STATE} from '../../../reducers';
import {createMockStore} from '../../../__testutils__/store';
import * as applicationService from '../../../services/application';


describe('MessageViewer component test suite', () => {
  let props;

  beforeEach(() => {
    props = {
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
  });
  describe('Snapshot render', () => {
    test('Should render MessageViewer', () => {
      // Given
      const currentProps = {...props};
      // When
      const messageViewer = shallow(<MessageViewer {...currentProps}/>);
      // Then
      expect(messageViewer).toMatchSnapshot();
    });
  });
  describe('component events', () => {
    test('componentDidMount', () => {
      // Given
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = jest.fn(() => originalAddEventListener.apply(null, arguments));
      // When
      shallow(<MessageViewer {...props}/>);
      // Then
      expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });
    test('componentWillUnmount', () => {
      // Given
      const messageViewer = shallow(<MessageViewer {...props}/>);
      const originalRemoveEventListener = window.removeEventListener;
      window.removeEventListener = jest.fn((type, listener) => {
        if (type === 'click') {
          expect(listener).toBe(messageViewer.instance().handleWindowOnClick);
        }
        return originalRemoveEventListener.apply(null, arguments);
      });
      // When
      messageViewer.unmount();
      // Then
      expect(window.removeEventListener).toHaveBeenCalledTimes(1);
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
  describe('windowOnClick', () => {
    let defaultEvent;
    beforeEach(() => {
      defaultEvent = {
        preventDefault: jest.fn(),
        target: {
          tagName: 'A',
          href: 'mailto:hello@hello.com'
        }
      };
    });
    test('Anchor with mailto href, should trigger mailto', () => {
      // Given
      props.mailto = jest.fn(to => {
        expect(to).toEqual('hello@hello.com');
      });
      const messageViewer = shallow(<MessageViewer {...props}/>);
      // When
      messageViewer.instance().handleWindowOnClick(defaultEvent);
      // Then
      expect(defaultEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(props.mailto).toHaveBeenCalledTimes(1);
    });
    test('Anchor with NOT mailto href, should NOT trigger mailto', () => {
      // Given
      props.mailto = jest.fn();
      defaultEvent.target.href = 'https://blog.marcnuri.com';
      const messageViewer = shallow(<MessageViewer {...props}/>);
      // When
      messageViewer.instance().handleWindowOnClick(defaultEvent);
      // Then
      expect(defaultEvent.preventDefault).toHaveBeenCalledTimes(0);
      expect(props.mailto).toHaveBeenCalledTimes(0);
    });
    test('Anchor child with mailto href, should trigger mailto', () => {
      // Given
      props.mailto = jest.fn((to, headers) => {
        expect(to).toEqual('hello@hello.com');
        expect(headers.cc).toEqual('world@hello.com');
      });
      defaultEvent.target.tagName = 'SPAN';
      defaultEvent.target.closest = jest.fn(() => ({
        href: 'mailto:hello@hello.com?cc=world@hello.com'
      }));
      const messageViewer = shallow(<MessageViewer {...props}/>);
      // When
      messageViewer.instance().handleWindowOnClick(defaultEvent);
      // Then
      expect(defaultEvent.target.closest).toHaveBeenCalledTimes(1);
      expect(defaultEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(props.mailto).toHaveBeenCalledTimes(1);
    });
  });
  describe('Connect functions', () => {
    test('mailto, service function called', () => {
      // Given
      const store = createMockStore(INITIAL_STATE);
      applicationService.mailto = jest.fn();
      const messageViewer = shallow(<ConnectedMessageViewer store={store} {...props}/>);
      // When
      messageViewer.props().mailto();
      // Then
      expect(applicationService.mailto).toHaveBeenCalledTimes(1);
    });
  });
});
