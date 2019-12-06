import * as applicationService from '../application';
import * as fetchService from '../fetch';
import {ActionTypes} from '../../actions/action-types';

describe('Application service test suite', () => {
  describe('login', () => {
    test('Response NOT OK, should set authentication error', done => {
      // Given
      global.fetch = jest.fn((url, options) => {
        expect(url).toEqual('/login');
        return Promise.resolve({ok: false, url, options,
          text: () => Promise.resolve('Authentication error')});
      });
      window.isotopeConfiguration = {_links: {'application.login': {href: '/login'}}};
      let dispatchCount = 0;
      const dispatch = jest.fn(action => {
        switch (action.type) {
          case ActionTypes.APPLICATION_BE_REQUEST:
          case ActionTypes.APPLICATION_BE_REQUEST_COMPLETED:
          case ActionTypes.LOGIN_FORM_VALUES_SET:
            dispatchCount++;
            break;
          case ActionTypes.APPLICATION_ERROR_SET:
            dispatchCount++;
            if (action.payload.value === 'Authentication error') {
              expect(dispatchCount).toEqual(5);
              done();
            }
            break;
          default:
        }
      });
      const credentials = {
        serverHost: 'server.host',
        serverPort: 1337
      };
      // When
      applicationService.login(dispatch, credentials);
      // Then
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
  describe('editNewMessage', () => {
    test('editNewMessage with valid message, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to.length).toEqual(0);
        expect(editedMessage.cc.length).toEqual(0);
        expect(editedMessage.bcc.length).toEqual(0);
        expect(editedMessage.attachments.length).toEqual(0);
        expect(editedMessage.subject).toEqual('');
        expect(editedMessage.content).toEqual('');
      });

      // When
      applicationService.editNewMessage(dispatch);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('mailto', () => {
    test('no to, no headers, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toHaveLength(0);
        expect(editedMessage.cc).toHaveLength(0);
        expect(editedMessage.bcc).toHaveLength(0);
        expect(editedMessage.attachments).toHaveLength(0);
        expect(editedMessage.subject).toEqual('');
        expect(editedMessage.content).toEqual('');
      });
      // When
      applicationService.mailto(dispatch);
      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('valid to, no headers, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toEqual(['to@be.com']);
        expect(editedMessage.cc).toHaveLength(0);
        expect(editedMessage.bcc).toHaveLength(0);
        expect(editedMessage.attachments).toHaveLength(0);
        expect(editedMessage.subject).toEqual('');
        expect(editedMessage.content).toEqual('');
      });
      const to = 'to@be.com';
      // When
      applicationService.mailto(dispatch, to);
      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('no to, valid headers, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toEqual(['reactive@isotope.com']);
        expect(editedMessage.cc).toHaveLength(0);
        expect(editedMessage.bcc).toHaveLength(0);
        expect(editedMessage.attachments).toHaveLength(0);
        expect(editedMessage.subject).toEqual('');
        expect(editedMessage.content).toEqual('');
      });
      const to = null;
      const headers = {
        to: 'reactive@isotope.com'
      };
      // When
      applicationService.mailto(dispatch, to, headers);
      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('valid to, valid headers, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toEqual(['to@be.com']);
        expect(editedMessage.cc).toEqual(['cc@be.com', 'othercc@be.com']);
        expect(editedMessage.bcc).toEqual(['bcc@be.com']);
        expect(editedMessage.attachments).toHaveLength(0);
        expect(editedMessage.subject).toEqual('Hence it is a subject of inquiry which can on no account be neglected');
        expect(editedMessage.content).toEqual('Strange body');
      });
      const to = 'to@be.com';
      const headers = {
        Cc: 'cc@be.com ,  othercc@be.com',
        bcc: 'bcc@be.com',
        subJect: 'Hence it is a subject of inquiry which can on no account be neglected',
        body: 'Strange body'
      };
      // When
      applicationService.mailto(dispatch, to, headers);
      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('editMessageAsNew', () => {
    test('editMessageAsNew with valid message, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to.length).toEqual(1);
        expect(editedMessage.cc.length).toEqual(1);
        expect(editedMessage.bcc.length).toEqual(1);
      });
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be edited as new',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };

      // When
      applicationService.editMessageAsNew(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('replyAllMessage', () => {
    test('replyAllMessage with valid message and all recipient types, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to.length).toEqual(2);
        expect(editedMessage.to).toContain('from@mail.com');
        expect(editedMessage.cc.length).toEqual(1);
        expect(editedMessage.bcc.length).toEqual(1);
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Re: /));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.From'));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.Date'));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.Subject'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });
      const message = {
        messageId: '1337-from@mail.com',
        references: '',
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be replied',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };

      // When
      applicationService.replyAllMessage(dispatch)(message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('replyAllMessage with valid message, reply-to address and all recipient types, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to.length).toEqual(2);
        expect(editedMessage.to).toContain('replyTo@mail.com');
        expect(editedMessage.cc.length).toEqual(1);
        expect(editedMessage.bcc.length).toEqual(1);
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Re: /));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.From'));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.Date'));
        expect(editedMessage.content).toEqual(expect.stringContaining('replyAction.Subject'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });
      const message = {
        messageId: '1337-from@mail.com',
        references: '',
        from: ['from@mail.com'],
        replyTo: ['replyTo@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be replied',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };

      // When
      applicationService.replyAllMessage(dispatch)(message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('replyMessage', () => {
    let message;
    beforeEach(() => {
      message = {
        messageId: '1337-from@mail.com',
        references: '',
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be replied',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };
    });
    test('replyMessage with valid message and all recipient types, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toHaveLength(1);
        expect(editedMessage.to).toContain('from@mail.com');
        expect(editedMessage.cc).toHaveLength(0);
        expect(editedMessage.bcc).toHaveLength(0);
      });
      // When
      applicationService.replyMessage(dispatch)(message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('replyMessage, valid message undefined subject, dispatch editMessage', () => {
      // Given
      delete message.subject;
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to).toHaveLength(1);
        expect(editedMessage.subject).toBe('Re: ');
      });
      // When
      applicationService.replyMessage(dispatch)(message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('forwardMessage', () => {
    test('forwardMessage with valid message and all recipient types, should dispatch editMessage', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.to.length).toEqual(0);
        expect(editedMessage.cc.length).toEqual(0);
        expect(editedMessage.bcc.length).toEqual(0);
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Fwd/));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.To'));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.Cc'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Cc', address: 'cc@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be forwarded',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };

      // When
      applicationService.forwardMessage(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
    test('forwardMessage with valid message and no cc recipient types, should dispatch editMessage with no cc', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_EDIT);
        const editedMessage = action.payload;
        expect(editedMessage.subject).toEqual(expect.stringMatching(/^Fwd/));
        expect(editedMessage.content).toEqual(expect.stringContaining('forwardAction.To'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('forwardAction.Cc'));
        expect(editedMessage.content).toEqual(expect.not.stringContaining('bcc@mail.com'));
      });
      const message = {
        from: ['from@mail.com'],
        recipients: [
          {type: 'To', address: 'to@mail.com'},
          {type: 'Bcc', address: 'bcc@mail.com'}
        ],
        subject: 'This message will be forwarded',
        attachments: [{fileName: 'file.1st', size: 1337, contentType: 'application/octet-stream'}]
      };

      // When
      applicationService.forwardMessage(dispatch, message);

      // Then
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
  describe('clearSelectedMessage', () => {
    test('clearSelectedMessage, should dispatch selectMessage null', () => {
      // Given
      const dispatch = jest.fn(action => {
        expect(action.type).toEqual(ActionTypes.APPLICATION_MESSAGE_SELECT);
        expect(action.payload).toEqual(null);
      });
      fetchService.abortFetch = jest.fn().mockImplementation(abortController =>
        expect(abortController).toEqual(fetchService.abortControllerWrappers.readMessageAbortController)
      );

      // When
      applicationService.clearSelectedMessage(dispatch);

      // Then
      expect(fetchService.abortFetch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
